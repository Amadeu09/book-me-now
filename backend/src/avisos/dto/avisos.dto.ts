import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ClausPushDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) p256dh: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) auth: string;
}

export class SubscripcioPushDto {
  @ApiProperty() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(1000) endpoint: string;
  @ApiProperty({ type: ClausPushDto }) @ValidateNested() @Type(() => ClausPushDto) keys: ClausPushDto;
}

export class BaixaPushDto {
  @ApiProperty() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(1000) endpoint: string;
}
