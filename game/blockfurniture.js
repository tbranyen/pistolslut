Engine.initObject("BlockFurniture", "Furniture", function() {
	var BlockFurniture = Furniture.extend({

		constructor: function(name, shapeData, visible) {
			this.base(name, Point2D.create(shapeData.x, shapeData.y));
			this.setupGraphics(shapeData, visible);
			this.finalSetup();
		},

		setupGraphics: function(s, visible) {
			this.add(Vector2DComponent.create("draw"));
			var shape = [ new Point2D(0, 0), new Point2D(0, s.h), new Point2D(s.w, s.h), new Point2D(s.w, 0)];
            this.getComponent("draw").setPoints(shape);
			this.getComponent("draw").setLineStyle("black");
			this.getComponent("draw").setFillStyle("black");

            if(visible === false)
                this.getComponent("draw").setDrawMode(RenderComponent.NO_DRAW);
		}
	}, {
		getClassName: function() { return "BlockFurniture"; },

	});

	return BlockFurniture;
});