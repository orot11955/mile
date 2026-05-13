import { BadRequestException } from '@nestjs/common';

export function toOptionalDate(value?: string | null): Date | null | undefined {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`Invalid date value: ${value}`);
  }

  return date;
}

export function toRequiredDate(value: string): Date {
  const date = toOptionalDate(value);

  if (!date) {
    throw new BadRequestException('Date value is required.');
  }

  return date;
}
