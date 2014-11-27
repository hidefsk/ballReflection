var canvas,
  context,
  balls = [],

  FPS = 1000 / 100,
  V0 = 0.0,
  V = 0.1
  vx_param  = V0,
	vy_param  = V,
  W = 640,
  H = 500,
  DAMPING_PARAM = 0.9,

  audio = new Audio('sound/reflection.mp3'),
  sound = false,

  color = {
		black:'rgb(0,0,0)',
		gray:'rgb(128,128,128)',
		blue:'rgb(0,0, 255)',
		navy:'rgb(0,0, 128)',
		teal:'rgb(0,128, 128)',
		green:'rgb(0,128,0)',
		lime:'rgb(0,255,0)',
		aqua:'rgb(0,255,255)',
		yellow:'rgb(255,255,0)',
		red:'rgb(255,0,0)',
		fuchsia:'rgb(255,0,255)',
		olive:'rgb(128,128,0)',
		purple:'rgb(128,0,128)',
		maroon:'rgb(128,0,0)',
	},

  COLORS = [
		color.red,
		color.blue,
		color.navy,
		color.teal,
		color.green,
		color.lime,
		color.aqua,
		color.yellow,
		color.olive,
		color.purple,
		color.maroon,
	];


// Ball class
var Ball = function(x, y, r, leftVelFlg, color) {
	this.x = x,
	this.y = y;
	this.r = r;
	this.vx = leftVelFlg ? 4 : -4,
	this.vy = 3;
	this.cnt = 1000;
	this.color = color;
}

Ball.prototype.update =function () {
	this.vx += vx_param; //重力加速度的な係数
	this.vy += vy_param; //重力加速度的な係数
	this.x += this.vx;
	this.y += this.vy;
};

Ball.prototype.drawCircle = function () {
	if(!canvas || !canvas.getContext) {
		return false;
	}
	context.beginPath();
  context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  context.fillStyle = this.color;
  context.fill();
};

Ball.prototype.refrectWall = function () {
	if(this.x - this.r <= 0 || W <= this.x + this.r) {
		this.vx *= -0.8;
		if(this.x - this.r <= 0){
			this.x = this.r;
		} 
		if(W <= this.x + this.r) {
			this.x = W - (this.r);
		}
		if(Math.abs(this.vx) < 1) {
			// this.vx = 0;
		} else {
			this.reflectSound();
		}
		return 'x';
	}
	if(this.y - this.r <= 0 || H <= this.y + this.r) {
		this.vy *= -0.8;

		if(this.y - this.r <= 0){
			this.y = this.r;
		}
		if(H <= this.y + this.r) {
			this.y = H - (this.r);
		}
		if(Math.abs(this.vy) < 1) {
			// this.vy = 0;
		} else {
			this.reflectSound();
		}
		return 'y';
	}
};

Ball.prototype.refrectBall = function (ball) {
	if(ball == null) {
		return false;
	}
	// 衝突
	if(Math.pow(ball.x - this.x, 2) + Math.pow(ball.y - this.y, 2) <= Math.pow(this.r + ball.r, 2)){

			// ぶつかった法線方向に速度が変わる
			var theta = Math.atan((ball.y - this.y) / (ball.x - this.x)); //rad
			this.v = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
			ball.v = Math.sqrt(Math.pow(ball.vx, 2) + Math.pow(ball.vy, 2));

			// 質量に応じて反射速度を変更
			var v_sum = (ball.v + this.v);
			this.v = (ball.r) / (this.r + ball.r) *  v_sum;
			ball.v = (this.r) / (this.r + ball.r) *  v_sum;
			
			this.vx = this.v * Math.abs(Math.cos(theta));
			this.vy = this.v * Math.abs(Math.sin(theta));
			ball.vx = ball.v * Math.abs(Math.cos(theta));
			ball.vy = ball.v * Math.abs(Math.sin(theta));

			if(this.x < ball.x) {
				this.vx *= -DAMPING_PARAM;
				ball.x = this.x + (this.r + ball.r) * Math.abs(Math.cos(theta));
			} else {
				ball.vx *= -DAMPING_PARAM;				
				ball.x = this.x - (this.r + ball.r) * Math.abs(Math.cos(theta));
			}

			if(this.y < ball.y) {
				this.vy *= -DAMPING_PARAM;
				ball.y = this.y + (this.r + ball.r) * Math.abs(Math.sin(theta));
			} else {
				ball.vy *= -DAMPING_PARAM;				
				ball.y = this.y - (this.r + ball.r) * Math.abs(Math.sin(theta));
			}
			this.cnt--;
			ball.cnt--;
			if(Math.abs(this.v) < 1) {
				// 
			} else {
				this.reflectSound();
			}

			return true;
	}
	return false;
};

Ball.prototype.reflectSound = function() {
	if(sound) {
		audio.play();
		audio = new Audio(audio.src);
	}
};

window.onload = function() {
	canvas = document.getElementById('canvasRect');
	context = canvas.getContext('2d');

	$(canvas).on('click', function(e){
		e.preventDefault();
		_createBall();
	});

	var $canvas = $('.js-canvas'),
	$gravityBtn = $('.js-gravity-btn');

	function _createBall() {
		var leftVelFlg = false;

		if(balls.length % 2 == 0) {
			leftVelFlg = true
		}

		var x = event.clientX - canvas.offsetLeft;
		var y = event.clientY - $canvas[0].offsetTop;

		var radius = Math.ceil(Math.random() * 3) * 10;

		balls.push(new Ball(x, y, radius, leftVelFlg, COLORS[balls.length % COLORS.length]));
	}

	$('.js-top-btn').on('click', function(){
			vx_param = V0;
			vy_param = -V1;
			$gravityBtn.removeClass('is-active');
			$(this).addClass('is-active');
	});

	$('.js-bottom-btn').on('click', function(){
			vx_param = V0;
			vy_param = V1;
			$gravityBtn.removeClass('is-active');
			$(this).addClass('is-active');
	});

	$('.js-left-btn').on('click', function(){
			vx_param = -V1;
			vy_param = V0;
			$gravityBtn.removeClass('is-active');
			$(this).addClass('is-active');
	});

	$('.js-right-btn').on('click', function(){
			vx_param = V1;
			vy_param = V0;
			$gravityBtn.removeClass('is-active');
			$(this).addClass('is-active');
	});

	$('.js-reset').on('click', function(){
		balls = [];
	});

	$('.js-sound').on('click', function(){
		var $self = $(this);
		if($self.hasClass('is-active')) {
			sound = false;
			$self.text('sound off');
			$self.removeClass('is-active');
		} else {
			sound = true;
			$self.text('sound on');
			$self.addClass('is-active');
		}
	});

	// 各ボールのループ処理
	setInterval(function() {
		context.clearRect(0,0,W,H);
			for(var i = 0; i < balls.length; i++) {
				for(var j = 0; j < balls.length; j++) {
					if(i != j) {
						balls[i].refrectBall(balls[j]);						
					}
				}

				balls[i].refrectWall();
				balls[i].drawCircle();
				balls[i].update();
				// cnt が0になったらそのballを削除
				if(balls[i].cnt <= 0){
					balls.splice(i, 1);
				}
			}
	}, FPS);
}
