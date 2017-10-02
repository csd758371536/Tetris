(function(){
	'use strict';

	/* 定义游戏格子 */
	var Grid = function(gridRow, gridCol, type) {
		this.gridRow = gridRow; // 格子所处行数
		this.gridCol = gridCol; // 格子所处列数
		this.gridType = type; // 格子类型
	};
	
	Grid.prototype = {
		gridColor: ["#B5B5B5", "#FF845E", "#CCFF00"], // 格子颜色
		gridRadius: 24, // 格子半径 24 20 16 12
		gridGap: 6, //格子间隙 6 5 4 3
		// 绘制格子
		drawGrid: function(game, context) {
			
		},
	};

	/* 定义游戏状态 */
	var Game = function(gameStart, gameScore, gameMaxScore) {
		this.gameStart = gameStart; // 游戏是否开始
		this.gameScore = gameScore; // 当前游戏分数
		this.gameMaxScore = gameMaxScore; // 游戏记录最高分
	};
	
	Game.prototype = {
		gameGridRowCount: 9, // 游戏格子行数
		gameGridColCount: 9, // 游戏格子列数
		gameCanvasWidth: 0, // 游戏画布宽度
		gameCanvasHeight: 0, // 游戏画布高度
		// 设置当前游戏分数
		setGameScore: function(gameScore) {
			document.getElementById("score").innerHTML = gameScore;
		},
		// 设置游戏记录最高分
		setGameMaxScore: function(gameMaxScore) {
			document.getElementById("maxScore").innerHTML = gameMaxScore;
		},
		// 设置游戏画布尺寸
		setGameCanvasSize: function() {
			// 获取格子数据
			var gridData = this.getGameGridData();
			// 定义画布宽度
			this.gameCanvasWidth = gridData.gridRadius * 2 * this.gameGridRowCount + 
									gridData.gridGap * (this.gameGridRowCount - 1) 
									+ gridData.gridRadius * 2 + gridData.gridGap / 2;
			// 定义画布高度						
			this.gameCanvasHeight = gridData.gridRadius * 2 * this.gameGridColCount + 
									gridData.gridGap * (this.gameGridColCount - 1);
			// 设置canvas宽度
			document.getElementById("canvas").setAttribute("width", this.gameCanvasWidth);
			// 设置canvas高度
			document.getElementById("canvas").setAttribute("height", this.gameCanvasHeight);
		},
		// 获取游戏格子半径及间隔
		getGameGridData: function() {
			var gridData = {};
			// 根据当前屏幕宽度来动态适配格子半径及间隔
			var clientWidth = document.body.clientWidth;
			if (clientWidth > 1023 && clientWidth < 1440) {
				gridData.gridRadius = 24;
				gridData.gridGap = 6;
			} else if (clientWidth > 768 && clientWidth < 1024) {
				gridData.gridRadius = 20;
				gridData.gridGap = 5;
			} else if (clientWidth > 480 && clientWidth < 769) {
				gridData.gridRadius = 16;
				gridData.gridGap = 4;
			} else if (clientWidth < 481) {
				gridData.gridRadius = 12;
				gridData.gridGap = 3;
			}
			return gridData;
		},
		// 初始化游戏格子
		initGameGrids: function(girdData, gameBarriers, cat) {
			var gridType, grid, isWalkable;
			var gameGrids = [];
			var game = this;
			for (var i = 0; i < this.gameGridRowCount; i++) {
				gameGrids[i] = [];
				for (var j = 0; j < this.gameGridColCount; j++) {
					gridType = 0;
					isWalkable = true;
					for (var k = 0; k < gameBarriers.length; k++) {
						if (gameBarriers[k].barrierX == i && gameBarriers[k].barrierY == j) {
							gridType = 1;
							isWalkable = false;
							break;
						}
					}
					if (cat.catX == i && cat.catY == j) {
						gridType = 2;
						isWalkable = false;
					}
					grid = new Grid(i, j, gridType, isWalkable);
					grid.gridRadius = girdData.gridRadius;
					grid.gridGap = girdData.gridGap;
					grid.drawGrid(game, context);
					gameGrids[i][j] = grid;
				}
			}
			return gameGrids;
		}
	};

	/* 程序基本配置 */
	var canvas = document.getElementById("canvas"); // 获得canvas元素
	var context = canvas.getContext("2d"); // 获得context对象

	var game; // 创建游戏对象
	var gameGrids = []; // 创建格子集合
	var cat; // 创建神经猫对象
	var isVisited; // 记录节点是否搜索的二维数组
	var searchDepth; // 记录节点搜索深度

	/* 判断游戏是否失败 */
	var isGameLose = function() {
		if (cat.catX == 0 || cat.catX == game.gameGridRowCount - 1 || 
			cat.catY == 0 || cat.catY == game.gameGridColCount - 1) {
			alert("You lose ! Please try again");
			document.location.reload();
		}
	};

	/* 判断游戏是否胜利 */
	var isGameWin = function() {
		var gameData = JSON.parse(window.localStorage.getItem("gameData"));
		// 如果缓存里有值
		if (gameData != null && gameData != undefined) {
			if (gameData.gameMinSteps > game.gameSteps) {
				gameData.gameMinSteps = game.gameSteps;
				window.localStorage.setItem("gameData", JSON.stringify(gameData));
			}
		} else {
			var data = {};
			data.gameMinSteps = game.gameSteps;
			window.localStorage.setItem("gameData", JSON.stringify(data));
		}
		alert("You win！Steps：" + game.gameSteps);
		document.location.reload();
	};

	/* canvas键盘事件 */
	

	// 游戏初始化
	var initGame = function() {
		// 游戏对象初始化
		game = new Game(true, 0, 0);
		// 获取缓存中的游戏记录数据
		var gameData = JSON.parse(window.localStorage.getItem("gameData"));
		// 判断缓存里是否有值
		if (gameData != null && gameData != undefined) {
			game.setGameMinSteps(gameData.gameMinSteps);
		} else {
			game.setGameMinSteps(game.gameMinSteps);
		}
		// 初始化当前游戏步数
		game.setGameSteps(game.gameSteps);
		// 设置当前游戏画布大小
		game.setGameCanvasSize();
		// 初始化神经猫
		cat = game.initGameCat();
		// 初始化格子
		gameGrids = game.initGameGrids(game.getGameGridData(), game.initGameBarriers(), cat);
	};

	initGame();
}());