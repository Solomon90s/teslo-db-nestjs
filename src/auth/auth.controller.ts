import { Controller, Post, Body, Get, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus( user );
  }

  @Get('private')
  @UseGuards( AuthGuard() ) //* Uso del guard para proteger la ruta
  testingPrivateRoute(
    @Req() request: Express.Request,
    //* Usamos nuestro decorador personalizado
    @GetUser() user: User, //* Nuestra entidad user
    @GetUser('email') userEmail: string,
    //* Usamos nuestro decorador personalizado
    @RawHeaders() rawHeaders: string,
  ){
    console.log(request);
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      userEmail,
      rawHeaders,
    }
  }

  @Get('private2')
  @UseGuards( AuthGuard(), UserRoleGuard ) //* Uso del guard para proteger la ruta
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user) //* Usamos el decorador que hemos creado
  privateRoute(
    @GetUser() user: User
  ) {
    return {
      ok: true, 
      user
    }
  }

  @Get('private3')
  /*
  * Le indicamos que para entrar a este endpoint tiene que ser o admin o superUser
  * @Auth(ValidRoles.admin, ValidRoles.superUser)
  */
  @Auth()
  privateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true, 
      user
    }
  }

}
