import { Expose } from 'class-transformer';

export class MentorDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  age?: number;

  @Expose()
  location?: string;

  @Expose()
  gender?: string;

  @Expose()
  expertise?: any;

  @Expose()
  capacity?: number;

  @Expose()
  availability?: any;

  @Expose()
  isActive?: boolean;

  constructor(partial: Partial<MentorDto>) {
    console.log('partial', partial);
    Object.assign(this, {
      id: partial.id,
      name: partial.name,
      email: partial.email,
      age: partial.age,
      location: partial.location,
      expertise: partial.expertise,
      capacity: partial.capacity,
      availability: partial.availability,
      isActive: partial.isActive,
    });
  }
}
