Engine.include("/engine/engine.math2d.js");
Engine.include("/engine/engine.particles.js");

Engine.initObject("BloodParticle", "Particle", function() {
	var BloodParticle = Particle.extend(/** @scope BloodParticle.prototype */{

		pos: null,
		vec: null,
		color: "#a00",

		constructor: function(pos, rot, spread, ttl) {
			this.base(ttl || 2000);
			this.pos = Point2D.create(pos);

			var a = (rot - (spread / 2)) + (Math.random() * spread);
			this.vec = Math2D.getDirectionVector(Point2D.ZERO, BloodParticle.ref, a);
			var vel = 2 + (Math.random() * 4);
			this.vec.mul(vel)
		},

		release: function() {
			this.base();
			this.pos = null;
			this.vec = null;
		},

		draw: function(renderContext, time) {
			this.pos.add(this.vec);
			this.pos.x = this.pos.x - renderContext.getHorizontalScroll();
			renderContext.setFillStyle(this.color);
			renderContext.drawPoint(this.pos);
		}

	}, {
		getClassName: function() {
			return "BloodParticle";
		},

		ref: new Point2D(0, -1) // A simple reference point for the "up" vector
	});

	return BloodParticle;
});

Engine.initObject("BurnoutParticle", "Particle", function() {

	var BurnoutParticle = Particle.extend(/** @scope BurnoutParticle.prototype */{

		pos: null,
		vec: null,
		color: null,

		constructor: function(pos, rot, spread, ttl, baseSpeed) {
			this.base(ttl || 2000);
			this.pos = Point2D.create(pos);

			var a = (rot - (spread / 2)) + (Math.random() * spread);
			this.vec = Math2D.getDirectionVector(Point2D.ZERO, BurnoutParticle.ref, a);
			//if(baseVelocity !== undefined)
            //    this.vec.add(baseVelocity);
			var vel = baseSpeed + (Math.random() * 2);
            this.vec.mul(vel);
		},

		release: function() {
			this.base();
			this.pos = null;
			this.vec = null;
			this.color = null;
		},

		draw: function(renderContext, time) {
			this.pos.add(this.vec);
			this.pos.x = this.pos.x - renderContext.getHorizontalScroll();

			var newColor = ParticleColorChanger.burnout(time, this.getBirth(), this.getTTL());
			if(this.color != newColor)
			{
				this.color = newColor;
				renderContext.setFillStyle(this.color);
			}

			renderContext.drawPoint(this.pos);
		}

	}, {
		getClassName: function() {
			return "BurnoutParticle";
		},

		ref: new Point2D(0, -1) // A simple reference point for the "up" vector
	});

	return BurnoutParticle;
});

Engine.initObject("ColoredParticle", "Particle", function() {
	var ColoredParticle = Particle.extend({
		vec: null,
		color: null,

		constructor: function(color, pos, ttl, angle, spread, velocity) {
			this.base(ttl);
            var p = pos.get();
			this.setPosition(pos.x, pos.y);
			this.color = color;

			var a = (angle - (spread / 2)) + (Math.random() * spread);
			this.vec = Math2D.getDirectionVector(Point2D.ZERO, ColoredParticle.UP, a);
			this.vec.mul(velocity);
		},

		release: function() {
			this.base();
			this.vec = null;
		},
	}, {
		getClassName: function() { return "ColoredParticle"; },

		UP: new Point2D(0, -1)
	});

	return ColoredParticle;
});

Engine.initObject("FireworkExplosionParticle", "ColoredParticle", function() {
	var FireworkExplosionParticle = ColoredParticle.extend({

		constructor: function(position) {
			var velocity = 0.1 + (Math.random() * 5);
			this.base("#ff0", position, 1000, 0, 360, velocity);
		},

		draw: function(renderContext, time) {
			this.getPosition().add(this.vec);
			this.setPosition(this.getPosition().x - renderContext.getHorizontalScroll(), this.getPosition().y);

			var newColor = ParticleColorChanger.explosion(time, this.birth, this.life)
			if(this.color != newColor)
			{
				this.color = newColor;
				renderContext.setFillStyle(this.color);
			}

			renderContext.drawPoint(this.getPosition());
		}

	}, {
		getClassName: function() { return "FireworkExplosionParticle"; },
	});

	return FireworkExplosionParticle;
});

Engine.initObject("FireParticle", "Particle", function() {

	var FireParticle = Particle.extend({

		pos: null,
		vec: null,
		color: null,

		constructor: function(x, y, width, maxTTL, startVec) {
			this.pos = Point2D.create(x + Math.floor(Math.random() * width), y);
			this.base(this.getFireParticleTTL(width, maxTTL));
			this.vec = Vector2D.create(FireParticle.UP);

			var vel = 0.5 + (Math.random() * 2);
			this.vec.mul(vel);
		},

		getFireParticleTTL: function(width, maxTTL)
		{
			var randPoint = Math.random() * width;
			var midPoint = width / 2;
	    if (randPoint > midPoint)
			{
	        var rightRandPoint = 1 - randPoint;
	        var height = 1 - ((rightRandPoint - ((1 - rightRandPoint) * rightRandPoint)) * (1 / (1 - midPoint)));
	    }
			else
	    	var height = (randPoint - ((1 - randPoint) * randPoint)) * (1 / midPoint);

			return ((height*height) / (width*width)) * maxTTL;
		},

		release: function() {
			this.base();
			this.pos = null;
			this.vec = null;
			this.color = null;
		},

		draw: function(renderContext, time) {
			this.pos.add(this.vec);
			this.pos.x = this.pos.x - renderContext.getHorizontalScroll();

			var newColor = ParticleColorChanger.explosion(time, this.birth, this.life)
			if(this.color != newColor)
			{
				this.color = newColor;
				renderContext.setFillStyle(this.color);
			}

			renderContext.drawPoint(this.pos);
		}

	}, {
		getClassName: function() { return "FireParticle"; },
		UP: new Vector2D(0, -1)

	});

	return FireParticle;
});

Engine.initObject("ParticleColorChanger", "Base", function() {
	var ParticleColorChanger = Base.extend({
	}, {

		explosion: function(time, birth, life) {
			var colr = null;
			var s = time - birth;
			var e = life - birth;

			colr = 255 - Math.floor(255 * (s / e));
			colr += (-10 + (Math.floor(Math.random() * 20)));
			var fb = (Math.random() * 100);
			if (fb > 90)
				colr = 255;
			colr = "#" + ("ff" + colr.toString(16) + "00");

			return colr;
		},

		burnout: function(time, birth, life) {
			var colr = "#f00";
			var s = time - birth;
			var e = life - birth;
			colr = 255 - Math.floor(255 * (s / e));
			colr += (-10 + (Math.floor(Math.random() * 20)));
			var fb = (Math.random() * 100);
			if (fb > 90)
				colr = 255;
			colr = "#" + (colr.toString(16) + colr.toString(16) + "66");

			return colr;
		},
	});

	return ParticleColorChanger;
});