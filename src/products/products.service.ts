import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  //* Para que los errores salgan mejor especificados en la consola
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) {}

  async create(createProductDto: CreateProductDto, user:User) {
    try {
      const { images = [], ...productDetails } = createProductDto; //* ... aquí es operador rest
      //* SOLO CREA LA INSTANCIA DEL PRODUCTO
      const product = this.productRepository.create({
        ...productDetails, //* Operador spread
        images: images.map( image => this.productImageRepository.create({ url: image})),
        user,
      });
      await this.productRepository.save(product);
      return { ...product, images: images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    //* Si no nos pasan limite tenemos 10 y si no nos mandan offset tenemos 0
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map( ({ images, ...rest }) => ({
      ...rest,
      images: images.map( img => img.url)
    }))
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      //* prod, llamamos así a la primera tabla donde se hace la query
      product = await queryBuilder
        .where(`UPPER (title) =:title or slug=:slug`, {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //* prodImages es un alias
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`);
    return product;
  }

  async findOnePlain( term:string ) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map( image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      /*
       * el preload lo que hace es, busca un producto por el id
       * y con el operador spread carga todas las propiedad del updateProductDto
       * ESTO NO ACTUALIZA LO PREPARA PARA LA ACTUALIZACIÓN
       */
      id: id,
      ...toUpdate,
    });
    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);
    //? Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    //* Aquí es donde lo estamos grabando en la base datos
    try {
      //* Evaluamos si vienen las imágenes
      if ( images ){
        /*
        * si vienen las imágenes las borramos todas
        * en el delete, le pasamos la entidad que se verá afectada
        * Y el criterio, MUCHO CUIDADO CON ESTO, podemos borrar todo sin darnos cuenta
        * el criterio es {product: { id } } EL ID DEL PRODUCTO
        * Con esto borramos las imágenes anteriores
        */
        await queryRunner.manager.delete( ProductImage,{product: { id } });
        /*
        * ahora añadimos nuevas imágenes, esto no impacta en la base de datos.
        */
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image }))
      }
      product.user = user;
      await queryRunner.manager.save(product); //* guardamos el producto, no impacta en la bd
      await queryRunner.commitTransaction(); //* Confirma la transacción. Da error si no se inició la transacción.
      await queryRunner.release(); //* Libera la conexión de base de datos utilizada
      // await this.productRepository.save(product);
      /*
      * esta sería una manera de actualizar el producto menos las imágenes y que las imágenes las muestre
      */
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }


}
