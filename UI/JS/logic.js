(function() {
	var chatApp = {
		currentChatUser: {name: "DefaultUserName"},
		messages: [],
		url : 'http://192.168.1.65:8080/chat/',    
		token : 'TN12EN',
		init: function() {
			this.currentChatUser.name = localStorage.getItem("username") || "NewUser";
			this.fetchServerData();
			//this.fetchLocalStorageData();
			this.cacheDOM();
			this.render();
			this.bindEvents();
		},
		fetchServerData: function() {
			var self = this;
			setInterval(function() {
				self.ajaxRequest('GET', self.url + '?token=' + self.token, null, function(responseText){
				var serverResponse = JSON.parse(responseText);
				//self.token = serverResponse.token;
				self.messages = serverResponse.messages;
				self.renderMessageList();
			});
			}, 5000);
		},

		fetchLocalStorageData: function() {
			// simulation for frontend demo
			//this.messages = JSON.parse(localStorage.getItem('messages')) || [];
		},
		cacheDOM: function() {
			this.chatHistory = document.querySelector('.chat-history');
			this.button = document.querySelector('button');
			this.nameInput = document.querySelector('input')
			this.textarea = document.querySelector('#message-to-send');
			this.chatHistoryList = document.querySelector('.chat-history ul');
			this.chatHeader = document.querySelector('.chat-header');
			this.currentUserName = document.querySelector('.chat-with .current-username');
			this.serverStatus = document.querySelector('.server-status');
		},
		render: function() {
			// rendering header
			this.renderChatHeader();
			// rendering messages
			this.renderMessageList();
		},
		renderChatHeader: function() {
			var headerTemplate = Handlebars.compile(document.getElementById("chat-header-template").innerHTML);
			var headerTemplateContext = {
				userName: this.currentChatUser.name,
			}
			this.chatHeader.innerHTML = (headerTemplate(headerTemplateContext));
		},
		renderMessageList: function() {
			var self = this;
			var messageTemplate = Handlebars.compile(document.getElementById("message-template").innerHTML);
			var messageResponseTemplate = Handlebars.compile(document.getElementById("message-response-template").innerHTML);
			self.chatHistoryList.innerHTML = "";
			this.messages.forEach(function(e) {
				var context = {
				messageOutput: e.text.length > 0 ? e.text : "This message has been removed",
				date: new Date(e.timestamp).toLocaleString('ru-RU'),
				userName: e.author,
				messageID: e.id,
				deletedClass: e.text.length > 0 ? "" : "removed"
				};
				if (e.author === self.currentChatUser.name) {
					self.chatHistoryList.innerHTML += (messageTemplate(context));
				}
				else {
					self.chatHistoryList.innerHTML += (messageResponseTemplate(context));
				}
			});
			this.scrollToBottom();
		},
		bindEvents: function() {
			var self = this;
			this.isTargetWindow = false;

			window.addEventListener('blur', function() {
				this.isTargetWindow = true;
			}.bind(this));

			window.addEventListener('focus', function() {
				this.isTargetWindow = false;
			}.bind(this));


			this.cacheDOM();

			this.nameInput.addEventListener('keyup', this.editUserName.bind(this));

			this.chatHistory.addEventListener('click', this.editMessage.bind(this));

			this.chatHistory.addEventListener('mouseover', function (e) {
				if (e.target.className.indexOf("align-right") !== -1) {
					var icon = e.target.children[0];
					icon.style.display = "initial";
					e.target.addEventListener('mouseout', function() {
						icon.style.display = "none";
					});
				}
				else if (e.target.className.indexOf("delete-icon") !== -1) {
					e.target.style.display = "initial";
					e.target.addEventListener('click', self.deleteMessage);
				}
			});

			this.button.addEventListener('click', this.sendMessage.bind(this));
			this.textarea.addEventListener('keyup', this.sendMessageOnEnter.bind(this));

		},
		editUserName: function(e) {
			if (e.keyCode === 13) {
				var newName = this.nameInput.value.toString().trim();
				if (newName.length > 0) {
					this.currentChatUser.name = newName;
					this.currentUserName.innerHTML = newName;
					this.nameInput.value = "";
					localStorage.setItem("username", newName);
				}
			}

		},
		editMessage: function(e) {
			var self = this;
			var date = new Date();
			var dateStr = "" + (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
			if (e.target.className.indexOf('other-message') !== -1) {
				// Storing inital message so that it can be later used to alter
				// local storage, server data, or whatever you need
				var initialContent = e.target.innerHTML.trim();
				e.target.contentEditable = true;
				e.target.addEventListener('blur', function (e) {
					// deleting message from messages array and storing changes in LocalStorage
					// for data change simulation
					if (!self.isTargetWindow) {
						var msgIndex = self.messages.findIndex(function (e) {
						return e.text.trim() == initialContent;
					});
					if (msgIndex != -1) {
						this.contentEditable = false;
						var message = this.innerHTML.trim();
						self.messages[msgIndex].text = message;

						//localStorage.setItem('messages', JSON.stringify(self.messages));
						this.innerHTML = message;
					}
					else return;
					// Here goes what happens when user finished editing the message
					// eg. Server data alternation
					// message to PUT on server is self.messages[msgIndex]
					self.ajaxRequest('PUT', self.url, JSON.stringify(self.messages[msgIndex]), null);
					}
				});
			}

		},
		deleteMessage: function() {
			var element = this.parentNode.closest("li").children[1];
			// first delete the message on server
			// and then if succesful, delete on frontend
			var message = {id: element.attributes[0].value, author: chatApp.currentChatUser.name, text: element.innerHTML.trim()};
			console.log(element.innerHTML.trim());

			// Ajax request to server to replace deleted message to a system message
			chatApp.ajaxRequest('DELETE', chatApp.url + '?msgId=' + message.id, JSON.stringify(message), function () {
				element.className += " removed";
				element.innerHTML = "This message has been removed";
			});

			//message.className += " removed";
			//message.innerHTML = "Message has been removed";

		},
		sendMessage: function() {
			messageToSend = this.textarea.value.trim();
			// Preparing the message and sending Ajax request to server with the message
			// if successful, rendering it on the frontend
			if (messageToSend !== "") {
				var self = this;
				var date = new Date();
				var message = {id: "" + this.generateUniqueID(), author: this.currentChatUser.name, text: messageToSend, timestamp: date.getTime()};

				this.ajaxRequest('POST', this.url, JSON.stringify(message), function(responseText){
					var template = Handlebars.compile(document.getElementById("message-template").innerHTML);
					var context = {
					messageOutput: message.text,
					date: date.toLocaleString('ru-RU'),
					userName: self.currentChatUser.name
					};

					self.chatHistoryList.innerHTML += (template(context));
				});


				this.messages.push(message);
				this.textarea.value = "";

				// adding message to local storage
				//localStorage.setItem('messages', JSON.stringify(this.messages));
			}
			this.scrollToBottom();
		},
		sendMessageOnEnter: function(e) {
			if (e.keyCode === 13) {
				this.sendMessage();
			}
		},
		scrollToBottom: function() {
			this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
		},
		ajaxRequest: function (method, url, data, execute) {
			var xhr = new XMLHttpRequest();


			xhr.open(method || 'GET', url, true);

			xhr.onload = function () {
				if (xhr.readyState !== 4) {
					return;
				}

				if(xhr.status != 200) {
				// error
				this.serverStatus.style.color = "red";
				this.serverStatus.innerHTML = "Server is not responding";
				return;
				}
				else {
					this.serverStatus.style.color = "green";
					this.serverStatus.innerHTML = "Connected to server";
				}
				if (execute) {
					execute(xhr.responseText)
				}

		}.bind(this);

		xhr.ontimeout = function () {
			this.serverStatus.style.color = "red";
			this.serverStatus.innerHTML = "Server timed out!";
		}.bind(this);

		xhr.onerror = function (e) {
			// handle error
			this.serverStatus.style.color = "red";
			this.serverStatus.innerHTML = "Server connection failed";
		}.bind(this);

		xhr.send(data);

		},

		generateUniqueID: function() {
			return parseInt((Date.now() * Math.random()) / 11)
		}

	};

	chatApp.init();
})();