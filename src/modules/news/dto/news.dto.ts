import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class NewsDto {
  @ApiProperty({ example: 'jkarnjkgnakls', description: 'Headlines of the News' })
  @IsNotEmpty()
  headlines: string;

  @ApiProperty({ example: 'afsbaegfsetaetbaerb', description: 'Content of the News' })
  @IsNotEmpty()
  content: string;
  
  @ApiProperty({ example: 'www.content-imageurl.com', description: 'Content Image of the News' })
  content_image: string;

  @ApiProperty({ example: ['90.5626262', '45.44695959'], description: 'Latitude and longitude of the News created at' })
  @IsNotEmpty()
  location: string[];

  @ApiProperty({ example: 'Gachibowli, Hyderabad', description: 'Name of the location where News is created' })
  location_name: string;

}
