import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ) {}
  
  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUsers();
    await this.insertNewProducts( firstUser );
    return 'SEED EXECUTED';
  }

  //* Eliminar base de datos, en orden, por el tema de las relaciones
  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  //* Insertar usuarios
  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    });
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  private async insertNewProducts( user: User) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = [];
    products.forEach( product => {
      insertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromises);
    return true;
  }
}
