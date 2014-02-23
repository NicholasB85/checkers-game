var Game = function(el) {
	this.boardEl = el;
	this.gameNew = function() {
		this.p1 = new Player('white');
		this.p2 = new Player('black');
		this.turn = this.p1;
		this.board = new Board(this);
	};

	this.checkMoveRule = function(from, to, mult, other) {
		var piece = this.board.pieces[from[0]][from[1]];
		var type = piece.color;


		// check the player turn
		if (type !== this.turn.color) {
			return false;
		}

		// verify if the piece is moving to an empty container
		if (this.board.pieces[to[0]][to[1]] !== null) {
			return false;
		}

		// verify if the piece is moving on the board
		if (to[0] < 0 || to[0] > 7 || to[1] < 0 || to[1] > 7) {
			return false;
		}

		if (!piece.isKing) {
			return this.checkRegularPieceMove(from, to, mult, other, type);
		} else {
			return this.checkKingPieceMove(from, to, mult, other, type);
		}

		return true;
	};

	this.checkRegularPieceMove = function(from, to, mult, other, type) {
		// verify all the basic moves
		if (from[0] + (mult * 2) === to[0]) {
			var side = to[1] == from[1] - 2 ? -1 : 1;

			if (to[1] !== from[1] + (side * 2)) {
				return false;
			}
			if (this.board.pieces[from[0] + mult][from[1] + side] === null || this.board.pieces[from[0] + mult][from[1] + side].color !== other.color) {
				return false;
			}
		} else {
			if (from[0] + mult !== to[0]) {
				return false;
			}
			if (to[1] !== from[1] - 1 && to[1] !== from[1] + 1) {
				return false;
			}
		}
		return true;
	};

	this.checkKingPieceMove = function(from, to, mult, other, type) {
		// check is going to vertical
		if (Math.abs(from[0] - to[0]) !== Math.abs(from[1] - to[1])) {
			return false;
		}
		var i, j;
		// there is piece on path
		var way = from[0] < to[0] ? 1 : -1;
		var side = from[1] < to[1] ? 1 : -1;



		for (i = from[0] + way, j = from[1] + side;
			(way * i) < (way * to[0]); i += way, j += side) {
			if (this.board.pieces[i][j] !== null) {
				if (type === this.board.pieces[i][j].color) {
					return false;
				}
				if ((i + way) == to[0] && (j + side) === to[1]) {
					break;
				}
				return false;
			}
		}

		return true;
	};

	this.checkAndRemovePiece = function(from, to, mult, other) {
		var piece = this.board.pieces[to[0]][to[1]];

		if (!piece.isKing) {
			var side = to[1] == from[1] - 2 ? -1 : 1;

			if (from[0] + (mult * 2) === to[0]) {
				if (to[1] == from[1] + (side * 2)) {
					this.board.removePiece([from[0] + mult], [from[1] + side]);
					return true;
				}
			}
		} else {
			var otherWay = from[0] < to[0] ? -1 : 1;
			var otherSide = from[1] < to[1] ? -1 : 1;

			if (this.board.pieces[to[0] + otherWay][to[1] + otherSide] !== null) {
				this.board.removePiece([to[0] + otherWay], [to[1] + otherSide]);
				return true;
			}
			return false;
		}

		return false;
	};

	this.turnKing = function(toRow, piece) {
		// check if the piece turned into a king
		if (toRow === 7 || toRow === 0) {
			piece.isKing = true;
			piece.el.className = 'piece piece-king-' + piece.color;
			return true;
		}
		return false;
	};

	this.checkPieceContinueMove = function(pos, mult, other, pieceRemoved) {
		if (!pieceRemoved) {
			return false;
		}

		// check if can go with other move
		if (pos[0] + (mult * 2) <= 7 && pos[0] + (mult * 2) >= 0 && ((pos[1] - 2) >= 0 || (pos[1] + 2) <= 7)) {
			if (this.board.pieces[pos[0] + (mult * 2)][pos[1] - 2] === null || this.board.pieces[pos[0] + (mult * 2)][pos[1] + 2] === null) {
				if (this.board.pieces[pos[0] + mult][pos[1] - 1] !== null && this.board.pieces[pos[0] + mult][pos[1] - 1].color === other.color) {
					return true;
				} else if (this.board.pieces[pos[0] + mult][pos[1] + 1] !== null && this.board.pieces[pos[0] + mult][pos[1] + 1].color === other.color) {
					return true;
				}
			}
		}
		return false;
	};

};

var Board = function(game) {
	this.el = game.boardEl;

	this.game = game;

	this.pieces = [];

	clear.apply(this);
	render.apply(this);

	this.el.addEventListener('mousemove', this, false);

	this.el.addEventListener("touchmove", this, false);


	this.handleEvent = function(e) {
		var el = e.target;
		e.preventDefault();

		switch (e.type) {
			// drag a piece along the move
			case 'touchmove':
			case 'mousemove':
				if (this.moving) {
					this.currentPiece.style.left = (e.clientX || e.touches.item(0).clientX) - 25 + 'px';
					this.currentPiece.style.top = (e.clientY || e.touches.item(0).clientY) - 25 + 'px';
				}
				break;
				// drag a piece
			case 'touchstart':
			case 'mousedown':
				this.currentPiece = el;
				el.style.position = 'absolute';
				this.moving = true;
				break;
				// drop a piece
			case 'touchend':
			case 'mouseup':
				el.style.position = '';
				this.moving = false;

				var realX = (e.clientX || e.changedTouches.item(0).clientX) - this.el.offsetLeft;
				var realY = (e.clientY || e.changedTouches.item(0).clientY) - this.el.offsetTop;

				var newX = parseInt(realX / 62);
				var newY = (7 - parseInt(realY / 62));

				var oldX = parseInt((el.parentElement.offsetLeft - this.el.offsetLeft) / 62);
				var oldY = 7 - parseInt((el.parentElement.offsetTop - this.el.offsetTop) / 62);

				this.movePiece(oldY, oldX, newY, newX);

				break;
		}
	};

	this.movePiece = function(oldY, oldX, newY, newX) {
		var mult = this.game.turn === this.game.p1 ? 1 : -1;
		var other = this.game.turn === this.game.p1 ? this.game.p2 : this.game.p1;

		// check if the piece can move
		if (game.checkMoveRule([oldY, oldX], [newY, newX], mult, other)) {
			this.pieces[oldY][oldX].move(newY, newX);

			this.pieces[newY][newX] = this.pieces[oldY][oldX];
			this.pieces[oldY][oldX] = null;

			var pieceRemoved = game.checkAndRemovePiece([oldY, oldX], [newY, newX], mult, other);

			game.turnKing(newY, this.pieces[newY][newX]);

			if (!game.checkPieceContinueMove([newY, newX], mult, other, pieceRemoved)) {
				this.game.turn = this.game.turn === this.game.p1 ? this.game.p2 : this.game.p1;
			}


		} else {
			this.pieces[oldY][oldX].moveBack();
		}
	};

	this.removePiece = function(row, col) {
		this.pieces[row][col] = null;
		document
			.querySelector('div[row="' + row + '"][col="' + col + '"]')
			.firstChild.remove();
	};

	function clear() {
		while (this.el.firstChild) {
			this.el.removeChild(this.el.firstChild);
		}
	}

	function render() {
		var player = this.game.p2;

		// create all rows, columns and pieces
		for (var i = 7; i >= 0; i--) {
			// initialize the row
			this.pieces[i] = [];
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
				if ((i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0)) {
					var piece = null;
					if (player) {
						piece = new Piece(player.color);
						piece.render(boardCell, this);
					}
					this.pieces[i][j] = piece;
				}

				boardCol.appendChild(boardCell);
				boardRow.appendChild(boardCol);
			}
			this.el.appendChild(boardRow);

			// change player
			if (i == 5) {
				player = null;
			} else if (i == 3) {
				player = this.game.p1;
			}
		}
	}
};

var Player = function(color) {
	this.color = color;
};

var Piece = function(color) {
	this.color = color;
	this.isKing = false;

	this.render = function(parent, that) {
		this.el = document.createElement('div');
		this.el.className = 'piece piece-' + this.color;
		parent.appendChild(this.el);

		// add events
		this.el.addEventListener('mousedown', that, false);
		this.el.addEventListener('mouseup', that, false);
		this.el.addEventListener('touchstart', that, false);
		this.el.addEventListener('touchend', that, false);
	};

	this.move = function(newY, newX) {
		var newParent = document.querySelector('div[row="' + newY + '"][col="' + newX + '"]');
		newParent.appendChild(this.el);
		this.el.style.left = newParent.offsetLeft + 'px';
		this.el.style.top = newParent.offsetTop + 'px';
	};

	this.moveBack = function() {
		this.el.style.left = this.el.parentElement.offsetLeft + 'px';
		this.el.style.top = this.el.parentElement.offsetTop + 'px';
	};

};

var game = new Game(document.querySelector('.board'));
game.gameNew();
