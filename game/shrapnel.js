Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Shrapnel", "PhysicsObject", function() {
	var Shrapnel = PhysicsObject.extend({
		field: null,
		shooter: null,

		baseSpeed: 15,
		damage: 1,
		safeDistance: 20,

        startPosition: null,

		constructor: function(field, shooter, epicentre, ttl) {
			this.base("Shrapnel");
			this.field = field;
			this.shooter = shooter;
			this.birth = new Date().getTime();
			this.life = this.birth + ttl;
            this.startPosition = Point2D.create(epicentre);

            this.createPhysicalBody();
            this.setupGraphics();

			var spread = 360;
			var a = (0 - (360 / 2)) + (Math.random() * spread);
			var speed = (1 + (Math.random() * 11)) * Shrapnel.VELOCITY_BOOST;
            var velocity = Math2D.getDirectionVector(Point2D.ZERO, Ordinance.tip, a).mul(speed);

            this.getPhysicsComponent().applyForce(velocity, this.getPosition());
		},

		createPhysicalBody: function() {
			this.boxSize = Point2D.create(1, 1);
			this.add(BoxBodyComponent.create("physics", this.boxSize));
            this.getPhysicsComponent().setRenderComponent(Vector2DComponent.create("draw"));
            this.setSimulation(this.field.simulation);

			this.setPosition(Point2D.create(this.getStartPosition()));

			this.getPhysicsComponent().setFriction(0);
			this.getPhysicsComponent().setRestitution(0);
			this.getPhysicsComponent().setDensity(0.01);
            this.getPhysicsComponent().getBodyDef().preventRotation = true;

            this.simulate();

            this.base();
		},

		setupGraphics: function() {
			var c_draw = this.getDrawComponent();
			c_draw.setPoints(Shrapnel.SHAPE);
			c_draw.setLineStyle("white");
			c_draw.setFillStyle("white");
		},

        collision: function(obj) {
            if(obj instanceof Furniture)
            {
                obj.shot(this);
                this.destroy();
            }
            else if(obj instanceof Human)
            {
                obj.shot(this);
                this.destroy();
            }
        },

        getStartPosition: function() { return this.startPosition; },

		update: function(renderContext, time) {
			if (time > this.life) // if past life, destroy
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
			var colr = ParticleColorChanger.explosion(time, this.birth, this.life);
			if(this.color != colr)
			{
				this.color = colr;
				this.getDrawComponent().setLineStyle(this.color);
			}
		},
	}, {
		getClassName: function() { return "Shrapnel"; },
		SHAPE: [new Point2D(0, 0), new Point2D(1, 0), new Point2D(1,  1), new Point2D(0,  1)],

        VELOCITY_BOOST: 40,
	});

	return Shrapnel;
});