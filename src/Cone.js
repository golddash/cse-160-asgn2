class Cone {
    constructor() {
      this.type = "cone";
      //this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
    }
  
    render() {
      //var xy = this.position;
      var rgba = this.color;
      //var size = this.size;
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      //gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      // front of cone
      drawTriangle3D([0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
  
      // left side of cone
      drawTriangle3D([0.0, 0.0, 1.0, 0.0, 1.0, 0.0, -1.0, 0.0, 0.0]);
  
      // right side of cone
      drawTriangle3D([0.0, 0.0, 1.0, -1.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
  
      // bottom of cone
      drawTriangle3D([1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
    }
  }
  