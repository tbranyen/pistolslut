Engine.initObject("BlockFurniture", "Furniture", function() {
	var BlockFurniture = Furniture.extend({
        shapeData: null,

		constructor: function(name, shapeData) {
            this.shapeData = shapeData;
			this.base(name);

			this.createPhysicalBody();
			this.setupGraphics(shapeData);
		},

		setupGraphics: function(s) {
			var shape = [new Point2D(0, 0), new Point2D(0, s.h), new Point2D(s.w, s.h), new Point2D(s.w, 0)];
			this.getDrawComponent().setPoints(shape);
			this.getDrawComponent().setLineStyle("black");
			this.getDrawComponent().setFillStyle("black");
		},

		createPhysicalBody: function() {
			this.boxSize = Point2D.create(this.shapeData.w, this.shapeData.h);
			this.add(BoxBodyComponent.create("physics", this.boxSize));
            this.getPhysicsComponent().setRenderComponent(Vector2DComponent.create("draw"));

			this.getPhysicsComponent().setFriction(0.1);
			this.getPhysicsComponent().setRestitution(0);
			this.getPhysicsComponent().setDensity(0);

			this.setPosition(Point2D.create(this.shapeData.x, this.shapeData.y));

            this.setSimulation(this.field.simulation);
            this.simulate();

            this.base();
		},
	}, {
		getClassName: function() { return "BlockFurniture"; },

	});

	return BlockFurniture;
});