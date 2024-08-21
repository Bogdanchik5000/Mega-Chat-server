class UserDto {
  name;
  room;

  constructor({ name, room }) {
    this.name = name;
    this.room = room;
  }
}

export default UserDto;
