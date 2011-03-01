Engine.include("/components/component.mover2d.js");
Engine.include("/components/component.vector2d.js");
Engine.include("/components/component.collider.js");
Engine.include("/engine/engine.object2d.js");

Engine.initObject("Ordinance", "PhysicsObject", function() {
	var Ordinance = PhysicsObject.extend({
		field: null,
		weapon: null,
		shooter: null,
        boxSize: null,

		constructor: function(weapon) {
			this.base("Ordinance");
			this.field = PistolSlut;

			// Track the shooting weapon
			this.weapon = weapon;
			this.shooter = this.weapon.owner;

			this.createPhysicalBody("physics", this.renderScale);
			this.getComponent("physics").setScale(this.renderScale);

			this.getComponent("physics").setRenderComponent(Vector2DComponent.create("draw"));
			this.setPosition(Point2D.create(this.weapon.getGunTip()));

            this.setSimulation(this.field.simulation);
            this.simulate();

			this.getPhysicsComponent().applyForce(this.weapon.ordinancePhysics.call(this.weapon), this.getPosition());

            this.setupGraphics();
		},

		setupGraphics: function() { },

		release: function() {
			this.base();
			this.weapon = null;
			this.shooter = null;
		},

		update: function(renderContext, time) {
			if (!this.field.inView(this)) // remove if not in field
			{
				this.destroy();
				return;
			}

			renderContext.pushTransform();
			this.base(renderContext, time);
			renderContext.popTransform();
		},

	}, {
		getClassName: function() { return "Ordinance"; },

		tip: new Point2D(0, -1),
	});

	return Ordinance;
});