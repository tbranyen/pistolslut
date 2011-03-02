Engine.initObject("BlockFurniture", "Furniture", function() {
	var BlockFurniture = Furniture.extend({
        shapeData: null,

		constructor: function(name, shapeData) {
            this.shapeData = shapeData;
			this.base(name);

			this.createPhysicalBody("physics", this.renderScale);
            this.setGameObjectReference();

			this.setupGraphics(shapeData);
		},

		setupGraphics: function(s) {
			var shape = [ new Point2D(0, 0), new Point2D(0, s.h), new Point2D(s.w, s.h), new Point2D(s.w, 0)];
			this.getDrawComponent().setPoints(shape);
			this.getDrawComponent().setLineStyle("black");
			this.getDrawComponent().setFillStyle("black");
		},

		createPhysicalBody: function(componentName, scale) {
			this.boxSize = Point2D.create(this.shapeData.w, this.shapeData.h);
			this.boxSize.mul(scale);
			this.add(BoxBodyComponent.create(componentName, this.boxSize));
            this.getComponent("physics").setRenderComponent(Vector2DComponent.create("draw"));

			this.getComponent(componentName).setFriction(0.1);
			this.getComponent(componentName).setRestitution(0);
			this.getComponent(componentName).setDensity(0);

			this.setPosition(Point2D.create(this.shapeData.x, this.shapeData.y));

            this.setSimulation(this.field.simulation);
            this.simulate();
		},
	}, {
		getClassName: function() { return "BlockFurniture"; },

	});

	return BlockFurniture;
});