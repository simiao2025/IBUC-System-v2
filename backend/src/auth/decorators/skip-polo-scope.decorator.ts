import { SetMetadata } from '@nestjs/common';

export const SKIP_POLO_SCOPE_KEY = 'skipPoloScope';
export const SkipPoloScope = () => SetMetadata(SKIP_POLO_SCOPE_KEY, true);
