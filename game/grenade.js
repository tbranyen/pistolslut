Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Grenade", "Ordinance", function() {
	var Grenade = Ordinance.extend({
		timeThrown: null,
		pinTimer: 20000, // how long the grenade takes to explode
		safeDistance: 40,

		constructor: function(weapon) {
			this.base(weapon);
			this.timeThrown = new Date().getTime();

			this.createPhysicalBody(5);
		},

		setupGraphics: function() {
			this.add(SpriteComponent.create("draw"));
			this.addSprite("main", this.field.spriteLoader.getSprite("grenade.gif", "main"));
			this.setSprite("main");
		},

		createPhysicalBody: function() {
			this.add(CircleBodyComponent.create("physics", Grenade.RADIUS));
            this.getPhysicsComponent().setRenderComponent(SpriteComponent.create("draw"));
            this.setSimulation(this.field.simulation);

			this.setPosition(Point2D.create(this.weapon.getGunTip()));

			this.getPhysicsComponent().setFriction(0.5);
			this.getPhysicsComponent().setRestitution(0.5);
			this.getPhysicsComponent().setDensity(0.01);
            this.getPhysicsComponent().getBodyDef().preventRotation = true;

            this.simulate();
		},

		release: function() {
			this.base();
			this.shooter = null;
			this.timeThrown = null;
		},

		update: function(renderContext, time) {
			if(this.timeThrown + this.pinTimer < new Date().getTime())
			{
				//this.explode();
				return;
			}

			renderContext.pushTransform();
			this.base(renderContext, time);
			renderContext.popTransform();
		},

		getCenter: function(obj) {
			var objCentre = Point2D.create(obj.getPosition());
			objCentre.setX(objCentre.x + (obj.getBoundingBox().dims.x / 2));
			objCentre.setY(objCentre.y + (obj.getBoundingBox().dims.y / 2));
			return objCentre;
		},

		shrapnelCount: 30,
		shrapnelTTL: 500,
		explode: function() {
			for(var x = 0; x < this.shrapnelCount; x++)
				this.field.renderContext.add(Shrapnel.create(this.field, this.shooter, this.getPosition(), this.shrapnelTTL));

			this.destroy();
		},
	}, {
		getClassName: function() { return "Grenade"; },

		tip: new Point2D(0, -1),
        RADIUS: 5,
	});

	return Grenade;
});