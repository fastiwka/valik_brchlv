#сообщений (с автором и датой), превышающих рекомендованную длину сообщения (140 символов);

SELECT Users.name, Messages.text, Messages.date FROM chat.Users, chat.Messages WHERE Messages.user_id=Users.id AND CHAR_LENGTH(Messages.text) >140;
