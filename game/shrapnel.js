Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Shrapnel", "Object2D", function() {

	var Shrapnel = Object2D.extend({
		field: null,
		baseSpeed: 15,
		damage: 1,
		shooter: null,
		
		birth: 0,
		life: 0,
		
		constructor: function(field, shooter, epicentre, ttl) {
			this.base("Shrapnel");
			this.field = field;
			this.shooter = shooter;
			this.birth = new Date().getTime();
			this.life = this.birth + ttl;

			// Add components to move and draw the shrapnel
			this.add(Mover2DComponent.create("move"));
			this.add(Vector2DComponent.create("draw"));
			this.add(ColliderComponent.create("collide", this.field.collisionModel));
			
			var mover = this.getComponent("move");
			var drawer = this.getComponent("draw");

			drawer.setPoints(Shrapnel.shape);
			drawer.setLineStyle("#f00");
			drawer.setFillStyle("#f00");
			
			var spread = 360;
			var rot = 0;
			var a = (rot - (spread / 2)) + (Math.random() * spread);
			var vel = 1 + (Math.random() * 11);
			
			mover.setPosition(epicentre);
			mover.setVelocity(Math2D.getDirectionVector(Point2D.ZERO, Shrapnel.tip, a));
			mover.setVelocity(mover.getVelocity().mul(vel));

			mover.setCheckLag(false);
		},

		update: function(renderContext, time) {
			// destroy if past life or not in level any more
			if (time > this.life || !this.field.inLevel(this.getPosition()))
			{
				this.destroy();
				return;
			}

			this.updateColor(renderContext, time);

			renderContext.pushTransform();
			this.base(renderContext, time);
			renderContext.popTransform();
		},
		
		updateColor: function(renderContext, time) {
			var colr = null;
			var s = time - this.birth;
			var e = this.life - this.birth;

			colr = 255 - Math.floor(255 * (s / e));
			colr += (-10 + (Math.floor(Math.random() * 20)));
			var fb = (Math.random() * 100);
			if (fb > 90)
				colr = 255;
			colr = "#" + ("ff" + colr.toString(16) + "00");

			if(this.color != colr)
			{
				this.color = colr;
				var drawer = this.getComponent("draw");
				drawer.setLineStyle(this.color);
				drawer.setFillStyle(this.color);
			}
		},

		onCollide: function(obj) {
			if(obj instanceof Furniture) {
				if(new CheapRect(this).isIntersecting(new CheapRect(obj)))
			  {
					obj.shot(this);
					this.destroy();
					return ColliderComponent.STOP;
				}
			}
			else if(obj instanceof Human) {
				if(obj.isAlive())
				{
					if(obj instanceof Enemy) // tell enemy about shots being fired
						this.field.notifier.post(Bullet.INCOMING_EVENT, this);
					
					if(new CheapRect(this).isIntersecting(new CheapRect(obj)))
				  {
						obj.shot(this);
						this.destroy();
						return ColliderComponent.STOP;
					}
				}
			}
			return ColliderComponent.CONTINUE;
		},

		release: function() {
			this.base();
		},

		destroy: function() {
			if (this.ModelData.lastNode)
				this.ModelData.lastNode.removeObject(this);
			this.base();
		},
	
		getVelocity: function() { return this.getComponent("move").getVelocity(); },
		setVelocity: function(vector) { return this.getComponent("move").setVelocity(vector); },

		getRenderPosition: function() { return this.getComponent("move").getRenderPosition(); },
		getLastPosition: function() { return this.getComponent("move").getLastPosition(); },
		getPosition: function() { return this.getComponent("move").getPosition(); },
		setPosition: function(point) {
			this.base(point);
			this.getComponent("move").setPosition(point);
		},

	}, {
		getClassName: function() { return "Shrapnel"; },
		shape: [new Point2D(-1, 0), new Point2D(0, 0), new Point2D(0,  0), new Point2D(0,  0)],
		tip: new Point2D(0, -1),
	});

	return Shrapnel;
});