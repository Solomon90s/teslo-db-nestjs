import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @ApiProperty({
        default: 10,
        description: 'How many rows do yo need'
    })
    @IsOptional()
    @IsPositive()
    //* Hay que transformarlo a número, por defecto son string
    @Type( () => Number)
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'How many rows do yo want to skip'
    })
    @IsOptional()
    @Min(0)
    //* Hay que transformarlo a número, por defecto son string
    @Type( () => Number)
    offset?:number
}