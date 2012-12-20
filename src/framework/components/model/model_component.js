pc.extend(pc.fw, function () {
    /**
     * @component
     * @name pc.fw.ModelComponent
     * @constructor Create a new ModelComponentSystem
     * @class Enables an Entity to render a model. This Component attaches additional model geometry in to the scene graph below the Entity.
     * @param {pc.fw.ModelComponentSystem} system The ComponentSystem that created this Component
     * @param {pc.fw.Entity} entity The Entity that this Component is attached to.
     * @extends pc.fw.Component
     * @property {String} asset The GUID of the asset for the model
     * @property {Boolean} castShadows If true, this model will cast shadows for lights that have shadow casting enabled.
     * @property {Boolean} receiveShadows If true, shadows will be cast on this model
     * @property {pc.scene.Model} model The mode; node that is added to the scene graph.
     */
    var ModelComponent = function ModelComponent (system, entity) {
        this.on("set_asset", this.onSetAsset, this);
        this.on("set_castShadows", this.onSetCastShadows, this);
        this.on("set_model", this.onSetModel, this);
        this.on("set_receiveShadows", this.onSetReceiveShadows, this);
    }
    ModelComponent = pc.inherits(ModelComponent, pc.fw.Component);
    
    pc.extend(ModelComponent.prototype, {
        /**
        * @function
        * @name pc.fw.ModelComponent#setVisible
        * @description Enable or disable rendering for the Model.
        * @param {Boolean} visible True to enable rendering for the model, false to disable it
        */
        setVisible: function (visible) {
            if (this.data.model) {
                var inScene = this.system.context.scene.containsModel(this.data.model);
                
                if (visible && !inScene) {
                    this.system.context.scene.addModel(this.data.model);
                } else if (!visible && inScene) {
                    this.system.context.scene.removeModel(this.data.model);
                }
            }
        },

        loadModelAsset: function(guid) {
            var request = new pc.resources.AssetRequest(guid);
            var options = {
                batch: this.entity.getRequestBatch()
            };
            
            this.system.context.loader.request(request, function (resources) {
                var asset = resources[guid];
                var url = asset.getFileUrl();
                this.system.context.loader.request(new pc.resources.ModelRequest(url), function (resources) {
                    var model = resources[url];
/*                    
                    if (this.system.context.designer) {
                        var geometries = model.getGeometries();
                        for (var i = 0; i < geometries.length; i++) {
                            geometries[i].generateWireframe();
                        }
                    }
*/                    
                    this.model = model;
                }.bind(this), function (errors, resources) {
                    Object.keys(errors).forEach(function (key) {
                        logERROR(errors[key]);
                    });
                }, function (progress) {
                }, options);
            }.bind(this), function (errors, resources) {
                Object.keys(errors).forEach(function (key) {
                    logERROR(errors[key]);
                });
            }, function (progress) {
                
            }, options);
        },

        onSetAsset: function (name, oldValue, newValue) {
            if(newValue) {
                this.loadModelAsset(newValue);
            } else {
                this.model = null;
            }
        },

        onSetCastShadows: function (name, oldValue, newValue) {
            if (newValue !== undefined) {
                var componentData = this.data;
                if (componentData.model) {
                    var meshInstances = componentData.model.meshInstances;
                    for (var i = 0; i < meshInstances.length; i++) {
                        meshInstances[i].castShadow = newValue;
                    }
                }
            }
        },

        onSetModel: function (name, oldValue, newValue) {
            if (oldValue) {
                this.system.context.scene.removeModel(oldValue);
                this.entity.removeChild(oldValue.getGraph());
            }

            if (newValue) {
                var componentData = this.data;
                var meshInstances = newValue.meshInstances;
                for (var i = 0; i < meshInstances.length; i++) {
                    meshInstances[i].castShadow = componentData.castShadows;
                    meshInstances[i].receiveShadow = componentData.receiveShadows;
                }

                this.entity.addChild(newValue.graph);
                this.system.context.scene.addModel(newValue);

                // Store the entity that owns this model
                newValue._entity = this.entity;

                // Update any animation component
                if (this.entity.animation) {
                    this.entity.animation.setModel(newValue);
                }
            }
        },

        onSetReceiveShadows: function (name, oldValue, newValue) {
            if (newValue !== undefined) {
                var componentData = this.data;
                if (componentData.model) {
                    var meshInstances = componentData.model.meshInstances;
                    for (var i = 0; i < meshInstances.length; i++) {
                        meshInstances[i].receiveShadow = newValue;
                    }
                }
            }
        }
    });

    return {
        ModelComponent: ModelComponent
    }
}());

