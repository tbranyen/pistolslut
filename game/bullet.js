Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Bullet", "Object2D", function() {
	var Bullet = Object2D.extend({
		shooter: null,
		weapon: null,
		field: null,

		baseSpeed: 15,
		damage: 1,
		
		constructor: function(weapon, projectileVelocityVariability) {
			this.base("Bullet");

			// This is a hack!
			this.field = PistolSlut;

			// Track the shooting weapon
			this.weapon = weapon;
			this.shooter = weapon.owner;

			// Add components to move and draw the bullet
			this.add(Mover2DComponent.create("move"));
			this.add(Vector2DComponent.create("draw"));
			this.add(ColliderComponent.create("collide", this.field.collisionModel));
			
			// Get the player's position and rotation,
			// then position this at the tip of the ship
			// moving away from it
			var p_mover = this.weapon.owner.getComponent("move");
			var c_mover = this.getComponent("move");
			var c_draw = this.getComponent("draw");

			c_draw.setPoints(Bullet.shape);
			c_draw.setLineStyle("white");
			c_draw.setFillStyle("white");
			
			var ownerPosition = Point2D.create(p_mover.getPosition());
			var gunTipPosition = this.weapon.getGunTip();
			var speed = this.baseSpeed + (Math.random() * projectileVelocityVariability * this.baseSpeed);
			
			c_mover.setPosition(gunTipPosition);
			c_mover.setVelocity(this.weapon.bulletPhysics.call(this.weapon).mul(speed));
			c_mover.setCheckLag(false);
		},

		release: function() {
			this.base();
			this.weapon = null;
		},

		/**
		 * Destroy a bullet, removing it from the list of objects in the last collision model node.
		 */
		destroy: function() {
			if (this.ModelData.lastNode) {
				this.ModelData.lastNode.removeObject(this);
			}
			this.base();
		},

		getPosition: function() {
			return this.getComponent("move").getPosition();
		},

		getRenderPosition: function() {
			return this.getComponent("move").getRenderPosition();
		},
	
		getVelocity: function() {
			return this.getComponent("move").getVelocity();
		},
	
		setVelocity: function(vector) {
			return this.getComponent("move").setVelocity(vector);
		},

		/**
		 * Returns the last position of the bullet
		 * @type Point2D
		 */
		getLastPosition: function() {
			return this.getComponent("move").getLastPosition();
		},

		/**
		 * Set the position of the bullet.
		 *
		 * @param point {Point2D} The position of the bullet.
		 */
		setPosition: function(point) {
			this.base(point);
			this.getComponent("move").setPosition(point);
		},

		/**
		 * Update the host object to reflect the state of the bullet.
		 *
		 * @param renderContext {RenderContext} The rendering context
		 * @param time {Number} The engine time in milliseconds
		 */
		update: function(renderContext, time) {
			var c_mover = this.getComponent("move");

			// Is this bullet in field any more?
			if (!this.field.inLevel(c_mover.getPosition()))
			{
				this.destroy();
				return;
			}

			renderContext.pushTransform();
			this.base(renderContext, time);
			renderContext.popTransform();
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

	}, {
		/**
		 * Get the class name of this object
		 *
		 * @type String
		 */
		getClassName: function() {
			return "Bullet";
		},

		shape: [ new Point2D(-1, 0), new Point2D(0, 0),
					new Point2D(0,  1), new Point2D(0,  1)],

		// The tip of the owner at zero rotation (up)
		tip: new Point2D(0, -1),
		
		INCOMING_EVENT: "incoming"
	});

	return Bullet;
});