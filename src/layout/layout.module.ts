import { Module } from '@nestjs/common';
import { LayoutService } from './layout.service';
import { LayoutController } from './layout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { layoutSchema } from './layout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Layout',
        schema: layoutSchema,
      },
    ]),
  ],
  providers: [LayoutService],
  controllers: [LayoutController],
})
export class LayoutModule {}
