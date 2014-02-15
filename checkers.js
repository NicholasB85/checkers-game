var Game = function() {
	var boardTable = document.querySelector('.board');
	this.start = function() {
		this.board = new Board(boardTable);
	};
};

var Board = function(boardTable) {
	this.boardTable = boardTable;
	this.gameBoard = [];
	this.moving = false;
	this.turn = 'white';
	// create new piece
	this.createPiece = function(cell, color) {
		if (color === 'empty') {
			return;
		}
		var piece = document.createElement('div');
		piece.className = 'piece piece-' + color;
		cell.appendChild(piece);
	};

	// build the board game
	this.build = function() {
		var piece = 'black';

		// remove all board children
		while (boardTable.firstChild) {
			boardTable.removeChild(boardTable.firstChild);
		}

		// create all rows, columns and pieces
		for (var i = 7; i >= 0; i--) {
			// initialize the row
			this.gameBoard[i] = [];
			var boardRow = document.createElement('div');
			boardRow.className = 'boardRow';

			// create the columns
			for (var j = 0; j < 8; j++) {
				var boardCol = document.createElement('div');
				boardCol.className = 'boardCol';

				// create the piece container
				var boardCell = document.createElement('div');
				boardCell.setAttribute('row', i);
				boardCell.setAttribute('col', j);

				// put the piece
				if (i % 2 === 0 && j % 2 === 0) {
					this.createPiece(boardCell, piece);
					this.gameBoard[i][j] = piece;
				} else if (i % 2 !== 0 && j % 2 !== 0) {
					this.createPiece(boardCell, piece);
					this.gameBoard[i][j] = piece;
				}

				boardCol.appendChild(boardCell);
				boardRow.appendChild(boardCol);
			}
			boardTable.appendChild(boardRow);

			// change piece color
			if (i == 5) {
				piece = 'empty';
			} else if (i == 3) {
				piece = 'white';
			}
		}
	};

	// Event Handler
	this.handleEvent = function(e) {
		switch (e.type) {
			// drag a piece along the mouse
			case 'mousemove':
				if (this.moving) {
					this.currentPiece.style.left = e.clientX - 25 + 'px';
					this.currentPiece.style.top = e.clientY - 25 + 'px';
				}
				break;
			// drag a piece
			case 'mousedown':
				var el = e.target;
				this.currentPiece = el;
				el.style.position = 'absolute';
				this.moving = true;
				break;
			// drop a piece
			case 'mouseup':
				var el = e.target;
				el.style.position = '';
				this.moving = false;

				var realX = e.clientX - this.boardTable.offsetLeft;
				var realY = e.clientY - this.boardTable.offsetTop;

				var newX = parseInt(realX / 62);
				var newY = (7 - parseInt(realY / 62));

				var oldX = parseInt((el.parentElement.offsetLeft - this.boardTable.offsetLeft) / 62);
				var oldY = 7 - parseInt((el.parentElement.offsetTop - this.boardTable.offsetTop) / 62);

				// check if the piece can move
				if (this.move([oldY, oldX], [newY, newX])) {
					var newParent = document.querySelector('div[row="' + newY + '"][col="' + newX + '"]');
					newParent.appendChild(el);
					el.style.left = newParent.offsetLeft + 'px';
					el.style.top = newParent.offsetTop + 'px';
				} else {
					el.style.left = el.parentElement.offsetLeft + 'px';
					el.style.top = el.parentElement.offsetTop + 'px';
				}
				break;
		}
	};

	// add mouse event to the game board
	this.boardTable.addEventListener('mousemove', this, false);

	// control piece drag n drop
	this.dragDropPiece = function(piece) {
		var currentPiece = this.currentPiece;
		piece.addEventListener('mousedown', this, false);

		piece.addEventListener('mouseup', this, false);
	};

	// initialize all pieces events
	this.initializePieces = function() {
		var pieces = document.querySelectorAll('.piece');
		for (var i = 0; i < pieces.length; i++) {
			this.dragDropPiece(pieces[i]);
		}
	};

	// check the rules and move the piece
	this.move = function(from, to) {
		var type = this.gameBoard[from[0]][from[1]];
		var itemRemoved = false;
		var isTurn = true;

		var mult = contains(type, 'white') ? 1 : -1;
		var other = contains(type, 'white') ? 'black' : 'white';

		// check the player turn
		if (!contains(type, this.turn)) {
			return false;
		}

		// verify if the piece is moving to an empty container
		if (this.gameBoard[to[0]][to[1]] !== 'empty') {
			return false;
		}

		if (contains(type, 'king')) {
			// check is going to vertical
			if (Math.abs(from[0] - to[0]) !== Math.abs(from[1] - to[1])) {
				return false;
			}
			var i, j;
			// there is piece on path
			if (from[0] < to[0] && from[1] < to[1]) {
				for (i = from[0] + 1, j = from[1] + 1; i < to[0]; i++, j++) {
					if(this.gameBoard[i][j] !== 'empty'){
						if(contains(type, this.gameBoard[i][j])){
							return false;
						}
						if((i + 1) == to[0] && (j + 1) === to[1]){
							this.remove(i, j);
							itemRemoved = true;
							break;
						}
						return false;
					}
				}
			}

			// there is piece on path
			if (from[0] < to[0] && from[1] > to[1]) {
				for (i = from[0] + 1, j = from[1] - 1; i < to[0]; i++, j--) {
					if(this.gameBoard[i][j] !== 'empty'){
						if(contains(type, this.gameBoard[i][j])){
							return false;
						}
						if((i + 1) == to[0] && (j - 1) === to[1]){
							this.remove(i, j);
							itemRemoved = true;
							break;
						}
						return false;
					}
				}
			}

			// there is piece on path
			if (from[0] > to[0] && from[1] > to[1]) {
				for (i = from[0] - 1, j = from[1] - 1; i > to[0]; i--, j--) {
					if(this.gameBoard[i][j] !== 'empty'){
						if(contains(type, this.gameBoard[i][j])){
							return false;
						}
						if((i - 1) == to[0] && (j - 1) === to[1]){
							this.remove(i, j);
							itemRemoved = true;
							break;
						}
						return false;
					}
				}
			}


			// there is piece on path
			if (from[0] > to[0] && from[1] < to[1]) {
				for (i = from[0] - 1, j = from[1] + 1; i > to[0]; i--, j++) {
					if(this.gameBoard[i][j] !== 'empty'){
						if(contains(type, this.gameBoard[i][j])){
							return false;
						}
						if((i - 1) == to[0] && (j + 1) === to[1]){
							this.remove(i, j);
							itemRemoved = true;
							break;
						}
						return false;
					}
				}
			}

			this.gameBoard[to[0]][to[1]] = this.gameBoard[from[0]][from[1]];
			this.gameBoard[from[0]][from[1]] = 'empty';
			// check the next turn
			if (isTurn) {
				this.turn = contains(this.turn, 'white') ? 'black' : 'white';
			}
			return true;
		}



		// verify if the piece is moving on the board
		if (to[0] < 0 || to[0] > 7 || to[1] < 0 || to[1] > 7) {
			return false;
		}


		// verify all the basic moves
		if (from[0] + (mult * 2) === to[0]) {
			if (to[1] !== from[1] - 2 && to[1] !== from[1] + 2) {
				return false;
			}
			if (to[1] == from[1] - 2) {
				if (!contains(this.gameBoard[from[0] + mult][from[1] - 1], other)) {
					return false;
				} else {
					this.remove(from[0] + mult, from[1] - 1);
					itemRemoved = true;
				}
			}
			if (to[1] == from[1] + 2) {
				if (!contains(this.gameBoard[from[0] + mult][from[1] + 1], other)) {
					return false;
				} else {
					this.remove(from[0] + mult, from[1] + 1);
					itemRemoved = true;
				}
			}
		} else {
			if (from[0] + mult !== to[0]) {
				return false;
			}
			if (to[1] !== from[1] - 1 && to[1] !== from[1] + 1) {
				return false;
			}
		}

		// move the piece
		this.gameBoard[to[0]][to[1]] = this.gameBoard[from[0]][from[1]];
		this.gameBoard[from[0]][from[1]] = 'empty';

		// check if can go with other move
		if (itemRemoved && contains(type, this.turn)) {
			if (to[0] + (mult * 2) <= 7 && to[0] + (mult * 2) >= 0 && ((to[1] - 2) >= 0 || (to[1] + 2) <= 7)) {
				if (this.gameBoard[to[0] + (mult * 2)][to[1] - 2] === 'empty' || this.gameBoard[to[0] + (mult * 2)][to[1] + 2] === 'empty') {
					if (contains(this.gameBoard[to[0] + mult][to[1] - 1], other)) {
						isTurn = false;
					} else if (contains(this.gameBoard[to[0] + mult][to[1] + 1], other)) {
						isTurn = false;
					}
				}
			}
		}

		// check if the piece turned into a king
		if (this.turn === 'white' && to[0] === 7) {
			this.gameBoard[to[0]][to[1]] = 'white-king';
			this.turnKing(from[0], from[1], this.turn);
		} else if (this.turn === 'black' && to[0] === 0) {
			this.gameBoard[to[0]][to[1]] = 'black-king';
			this.turnKing(from[0], from[1], this.turn);
		}

		// check the next turn
		if (isTurn) {
			this.turn = contains(this.turn, 'white') ? 'black' : 'white';
		}

		return true;
	};

	this.remove = function(row, col) {
		this.gameBoard[row][col] = 'empty';
		document
			.querySelector('div[row="' + row + '"][col="' + col + '"]')
			.firstChild.remove();
	};

	this.turnKing = function(row, col, type) {

		document
			.querySelector('div[row="' + row + '"][col="' + col + '"]')
			.firstChild.className = 'piece piece-king-' + type;
	};

	function contains(s1, s2) {
		return s1.indexOf(s2) !== -1;
	}

	this.build();
	this.initializePieces();
};



var game = new Game();
game.start();
