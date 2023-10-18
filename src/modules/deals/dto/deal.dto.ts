import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class DealDto {
  @ApiProperty({ example: 'EN1', description: 'Id of the Entity' })
  @IsNotEmpty()
  entity_id: string;

  @ApiProperty({ example: 'Television', description: 'Name of the Product' })
  @IsNotEmpty()
  product: string;
  
  @ApiProperty({ example: 'www.content-imageurl.com', description: 'Product Image of the Deal' })
  deal_image: string;

  @ApiProperty({ example: '25% Off', description: 'Deal offered by the Entity on the Product' })
  @IsNotEmpty()
  deal: string;

  @ApiProperty({ example: '26-09-2023', description: 'Expiry date of the Deal' })
  @IsNotEmpty()
  expiry_date: string;

}
