#всех сообщений конкретного пользователя, которые были написаны 9 мая 2016 года;

SELECT Users.name, Messages.text, Messages.date FROM chat.Users, chat.Messages WHERE Messages.user_id=Users.id AND  Users.id=3 AND Messages.date='2016-04-09'