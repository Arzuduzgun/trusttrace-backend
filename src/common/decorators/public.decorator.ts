//Endpoint’in üstüne yapıştırılan bir etiket. Kendisi hiçbir iş yapmaz; sadece “bu endpoint giriş gerektirmez” diye not düşer.
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
