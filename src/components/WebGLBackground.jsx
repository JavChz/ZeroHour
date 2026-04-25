import { useEffect, useRef } from 'react';

const vsSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform int u_isDark;

  float random (in vec2 _st) {
      return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in vec2 _st) {
      vec2 i = floor(_st);
      vec2 f = fract(_st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm ( in vec2 _st) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
      for (int i = 0; i < 5; ++i) {
          v += a * noise(_st);
          _st = rot * _st * 1.8 + shift;
          a *= 0.5;
      }
      return v;
  }

  void main() {
      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      st.x *= u_resolution.x/u_resolution.y;

      float t = u_time * 0.4; // Toned down speed for more subtle feel

      vec2 q = vec2(0.);
      q.x = fbm( st + 0.05 * t);
      q.y = fbm( st + vec2(1.0));

      vec2 r = vec2(0.);
      r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*t );
      r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*t);

      float f = fbm(st+r);

      // Deep dark blue/teal/emerald for dark mode
      vec3 darkBg = vec3(0.02, 0.05, 0.09);     
      vec3 darkColor1 = vec3(0.05, 0.20, 0.35); 
      vec3 darkColor2 = vec3(0.03, 0.18, 0.20); 

      // Light mode equivalents - much brighter and airy
      vec3 lightBg = vec3(0.98, 0.99, 1.0);
      vec3 lightColor1 = vec3(0.88, 0.94, 0.98);
      vec3 lightColor2 = vec3(0.90, 0.97, 0.95);

      vec3 bg = u_isDark == 1 ? darkBg : lightBg;
      vec3 color1 = u_isDark == 1 ? darkColor1 : lightColor1;
      vec3 color2 = u_isDark == 1 ? darkColor2 : lightColor2;

      vec3 color = mix(bg, color1, clamp((f*f)*4.0, 0.0, 1.0));
      color = mix(color, color2, clamp(length(q), 0.0, 1.0));
      color = mix(color, color1, clamp(length(r.x), 0.0, 1.0));

      // Subtle mix to keep background presence and text contrast high
      vec3 finalColor = mix(bg, color, 0.45); 
      gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
  }
`;

export default function WebGLBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Compile shaders
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader validation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Setup geometry (full screen quad)
    const vertices = new Float32Array([
        -1.0, -1.0,  
         1.0, -1.0,  
        -1.0,  1.0,  
         1.0,  1.0
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const isDarkLoc = gl.getUniformLocation(program, 'u_isDark');

    const RENDER_SCALE = 0.15; // Raised slightly so form is retained

    const handleResize = () => {
      // Scale resolution down heavily to save GPU
      canvas.width = Math.max(window.innerWidth * RENDER_SCALE, 64);
      canvas.height = Math.max(window.innerHeight * RENDER_SCALE, 64);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let reqId;
    const startTime = performance.now();

    const render = (time) => {
      gl.uniform1f(timeLoc, (time - startTime) / 1000);
      gl.uniform1i(isDarkLoc, theme === 'dark' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      reqId = requestAnimationFrame(render);
    };

    reqId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      gl.deleteProgram(program);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-20 pointer-events-none blur-[25px] scale-[1.1]" />;
}
