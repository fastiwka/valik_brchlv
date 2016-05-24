#количества сообщений каждого пользователя, написанных 9 мая (с учетом всех зарегистрированных пользователей);

SELECT U.id, U.name, (SELECT COUNT(*) FROM Messages M WHERE U.id = M.user_id AND M.date = '2016-05-09') AS counts FROM Users U
