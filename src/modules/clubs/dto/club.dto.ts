import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ClubTypes } from 'src/enums/club-types.enum';

export class ClubDto {
  @ApiProperty({ example: 'Health Club', description: 'Name of the Club' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Health', description: 'Type of the Club' })
  @IsNotEmpty()
  @IsEnum(ClubTypes)
  type: ClubTypes;

  @ApiProperty({ example: 'ejafnvjeb;lkabfv', description: 'Description of the Club' })
  @IsNotEmpty()
  description: string;
  
  @ApiProperty({ example: 'www.content-imageurl.com', description: 'Image of the Club' })
  club_image: string;

}
