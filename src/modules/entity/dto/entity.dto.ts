import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/enums/entity-type.enum';
import { Gender } from 'src/enums/gender.enum';

export class EntityDto {
  @ApiProperty({ example: 'U12', description: 'Type of the Entity' })
  @IsNotEmpty()
  entity_type: EntityType;

  @ApiProperty({ example: 'Kushal', description: 'Name of the Entity User' })
  @IsNotEmpty()
  first_name: string;
  
  @ApiProperty({ example: 'Kumar', description: 'Contact number of the Entity User' })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'kushalkumar@gmail.com', description: 'Phone number of the Entity User' })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: '9876585236', description: 'Email of the Entity User' })
  email: string;

  @ApiProperty({ example: 'www.proschool.in', description: 'Gender of the Entity User' })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'sample Url', description: 'Url of the Display photo of the Entity User' })
  display_photo: string;

}
