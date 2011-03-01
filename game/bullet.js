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

		createPhysicalBody: function(componentName, scale) {
			this.boxSize = Point2D.create(1, 1);
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));

			this.getComponent(componentName).setFriction(0);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(0.01);
            this.getComponent(componentName).getBodyDef().preventRotation = true;
		},
	}, {
		getClassName: function() { return "Bullet"; },

		SHAPE: [ new Point2D(0, 0), new Point2D(1, 0), new Point2D(1,  1), new Point2D(0, 1)],
	});

	return Bullet;
});