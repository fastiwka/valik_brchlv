#всех сообщений конкретного пользователя по заданному id;

SELECT Users.name, Messages.text, Messages.date FROM chat.Users, chat.Messages WHERE Messages.user_id=Users.id AND  Users.id=2