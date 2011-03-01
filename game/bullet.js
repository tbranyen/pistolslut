Engine.initObject("Bullet", "Ordinance", function() {
	var Bullet = Ordinance.extend({
		damage: 1,
		safeDistance: 30,

		constructor: function(weapon) {
			this.base(weapon);
            this.field.notifier.post(AIComponent.SOUND, this);
		},

		setupGraphics: function() {
			var c_draw = this.getDrawComponent();
			c_draw.setPoints(Bullet.SHAPE);
			c_draw.setLineStyle("white");
			c_draw.setFillStyle("white");
		},

		createPhysicalBody: function() {
			this.boxSize = Point2D.create(1, 1);
			this.add(BoxBodyComponent.create("physics", this.boxSize));
            this.getPhysicsComponent().setRenderComponent(Vector2DComponent.create("draw"));
            this.setSimulation(this.field.simulation);

			this.setPosition(Point2D.create(this.weapon.getGunTip()));

			this.getPhysicsComponent().setFriction(0);
			this.getPhysicsComponent().setRestitution(0);
			this.getPhysicsComponent().setDensity(0.01);
            this.getPhysicsComponent().getBodyDef().preventRotation = true;

            this.simulate();
		},
	}, {
		getClassName: function() { return "Bullet"; },

		SHAPE: [ new Point2D(0, 0), new Point2D(1, 0), new Point2D(1,  1), new Point2D(0, 1)],
	});

	return Bullet;
});