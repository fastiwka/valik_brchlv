#всех сообщений (с автором и временем), в которых используется ключевое слово (или вхождение).

SELECT Users.name, Messages.text, Messages.date FROM chat.Users, chat.Messages WHERE Messages.user_id=Users.id  AND Messages.text  LIKE '%w%'
