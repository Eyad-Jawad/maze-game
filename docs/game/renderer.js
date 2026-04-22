import { mat4, vec3 } from './node_modules/gl-matrix/esm/index.js';
import { MazeGenerator } from "./mazeObject.js";

class Renderer {
    constructor(mazeObject, canvas) {
        this.gl = canvas.getContext("webgl");
        if (!this.gl) throw new Error("WebGl was not found.");

        this.maze = mazeObject;

        this.cameraPositions = vec3.fromValues(
            0.5, // x
            1.0, // z
            -0.5 // y
        );
        this.cameraAngles = vec3.fromValues(
            0.0, // pitch
            0.0, // roll
            0.0  // yaw
        );

        this.modelMatrix = mat4.create();
        this.perspectiveMatrix = mat4.create();
        this.view = mat4.create();

        mat4.identity(this.modelMatrix);

        this.gl.enable(this.gl.DEPTH_TEST);
        canvas.width = 1920;
        canvas.height = 1080;
        this.gl.viewport(
            0, 
            0, 
            canvas.width, 
            canvas.height
        );

        mat4.perspective(
            this.perspectiveMatrix, 
            Math.PI / 3, // fov
            canvas.width / canvas.height, // aspect ratio
            0.1,  // near
            100.0 // far
        );

        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertexShader, `
            attribute vec3 position;
            uniform vec3 camera;
            uniform mat4 view;
            uniform mat4 model;
            uniform mat4 projection;
            varying float depth;
        
            void main() {
                vec3 pos = position - camera;
                depth = sqrt(pos.x * pos.x + pos.z * pos.z);
                
                gl_Position = projection * view * model * vec4(position, 1.0);
            }
        `);
        this.gl.compileShader(this.vertexShader);
        
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragmentShader, `
            precision mediump float;
        
            varying float depth;
        
            void main() {
                float brightness = 1.0 / (1.0 + depth * 0.8);
                gl_FragColor = vec4(0, brightness, brightness, 1);
            }
        `);
        this.gl.compileShader(this.fragmentShader);
            
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.fragmentShader);
        this.gl.linkProgram(this.program);

        this.positionLocation   = this.gl.getAttribLocation(this.program, `position`);
        this.projectionLocation = this.gl.getUniformLocation(this.program, `projection`);
        this.modelLocation      = this.gl.getUniformLocation(this.program, `model`);
        this.viewLocation       = this.gl.getUniformLocation(this.program, `view`);
        this.cameraLocation     = this.gl.getUniformLocation(this.program, `camera`);

        this.buffer = this.gl.createBuffer();
    }

    initMaze() {
        this.gl.bindBuffer(
            this.gl.ARRAY_BUFFER, 
            this.buffer
        );

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, 
            new Float32Array(this.maze.maze3D), 
            this.gl.DYNAMIC_DRAW
        );

        this.vertexCount = this.maze.maze3D.length / 3;
    }

    updateMazeView(forward) {
        const target = vec3.create();
        vec3.add(
            target, 
            this.cameraPositions, 
            forward
        );
        mat4.lookAt(
            this.view, 
            this.cameraPositions, 
            target, 
            vec3.fromValues(
                0.0, 
                1.0, 
                0.0
            )
        );

        this.gl.useProgram(this.program);
        this.gl.bindBuffer(
            this.gl.ARRAY_BUFFER, 
            this.buffer
        );
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(
            this.positionLocation, 
            3, 
            this.gl.FLOAT, 
            false, 
            0, 
            0
        );
    
        this.gl.uniformMatrix4fv(
            this.projectionLocation, 
            false, 
            this.perspectiveMatrix
        );
        this.gl.uniformMatrix4fv(
            this.modelLocation, 
            false, 
            this.modelMatrix
        );
        this.gl.uniformMatrix4fv(
            this.viewLocation, 
            false, 
            this.view
        );
        this.gl.uniform3fv(
            this.cameraLocation, 
            new Float32Array(this.cameraPositions)
        );

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
        
        console.log(this.gl.getShaderInfoLog(this.vertexShader));
        console.log(this.gl.getShaderInfoLog(this.fragmentShader));
        console.log(this.gl.getProgramInfoLog(this.program));
    }
}

export { Renderer };