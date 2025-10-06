/**
 * Calculates the area of a circle given its radius
 * @param radius The radius of the circle
 * @returns The area of the circle
 */
export const circleArea = (radius: number): number => {
  if (radius < 0) {
    throw new Error('Radius cannot be negative');
  }
  return Math.PI * radius * radius;
};

/**
 * Calculates the circumference of a circle given its radius
 * @param radius The radius of the circle
 * @returns The circumference of the circle
 */
export const circleCircumference = (radius: number): number => {
  if (radius < 0) {
    throw new Error('Radius cannot be negative');
  }
  return 2 * Math.PI * radius;
};

/**
 * Calculates the area of a rectangle given its length and width
 * @param length The length of the rectangle
 * @param width The width of the rectangle
 * @returns The area of the rectangle
 */
export const rectangleArea = (length: number, width: number): number => {
  if (length < 0 || width < 0) {
    throw new Error('Length and width cannot be negative');
  }
  return length * width;
};

/**
 * Calculates the area of a triangle given its base and height
 * @param base The base of the triangle
 * @param height The height of the triangle
 * @returns The area of the triangle
 */
export const triangleArea = (base: number, height: number): number => {
  if (base < 0 || height < 0) {
    throw new Error('Base and height cannot be negative');
  }
  return 0.5 * base * height;
};

/**
 * Calculates the area of a triangle using Heron's formula given three sides
 * @param a First side length
 * @param b Second side length
 * @param c Third side length
 * @returns The area of the triangle
 */
export const triangleAreaHeron = (a: number, b: number, c: number): number => {
  if (a <= 0 || b <= 0 || c <= 0) {
    throw new Error('All sides must be positive');
  }
  
  // Check triangle inequality
  if (a + b <= c || a + c <= b || b + c <= a) {
    throw new Error('The given sides do not form a valid triangle');
  }
  
  const s = (a + b + c) / 2; // semi-perimeter
  const areaSquared = s * (s - a) * (s - b) * (s - c);
  
  return Math.sqrt(areaSquared);
};

/**
 * Calculates the volume of a sphere given its radius
 * @param radius The radius of the sphere
 * @returns The volume of the sphere
 */
export const sphereVolume = (radius: number): number => {
  if (radius < 0) {
    throw new Error('Radius cannot be negative');
  }
  return (4 / 3) * Math.PI * Math.pow(radius, 3);
};

/**
 * Calculates the volume of a rectangular prism given its dimensions
 * @param length The length of the prism
 * @param width The width of the prism
 * @param height The height of the prism
 * @returns The volume of the prism
 */
export const rectangularPrismVolume = (length: number, width: number, height: number): number => {
  if (length < 0 || width < 0 || height < 0) {
    throw new Error('Dimensions cannot be negative');
  }
  return length * width * height;
};

/**
 * Calculates the volume of a cylinder given its radius and height
 * @param radius The radius of the cylinder
 * @param height The height of the cylinder
 * @returns The volume of the cylinder
 */
export const cylinderVolume = (radius: number, height: number): number => {
  if (radius < 0 || height < 0) {
    throw new Error('Radius and height cannot be negative');
  }
  return Math.PI * Math.pow(radius, 2) * height;
};

/**
 * Calculates the area of an ellipse given its semi-major and semi-minor axes
 * @param a Semi-major axis
 * @param b Semi-minor axis
 * @returns The area of the ellipse
 */
export const ellipseArea = (a: number, b: number): number => {
  if (a < 0 || b < 0) {
    throw new Error('Axes cannot be negative');
  }
  return Math.PI * a * b;
};

/**
 * Calculates the surface area of a sphere given its radius
 * @param radius The radius of the sphere
 * @returns The surface area of the sphere
 */
export const sphereSurfaceArea = (radius: number): number => {
  if (radius < 0) {
    throw new Error('Radius cannot be negative');
  }
  return 4 * Math.PI * Math.pow(radius, 2);
};

/**
 * Calculates the distance between two points in 2D space
 * @param x1 X-coordinate of first point
 * @param y1 Y-coordinate of first point
 * @param x2 X-coordinate of second point
 * @param y2 Y-coordinate of second point
 * @returns The distance between the two points
 */
export const distance2D = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Calculates the angle of a right triangle in degrees given opposite and adjacent sides
 * @param opposite Length of the opposite side
 * @param adjacent Length of the adjacent side
 * @returns The angle in degrees
 */
export const rightTriangleAngle = (opposite: number, adjacent: number): number => {
  if (adjacent === 0) {
    throw new Error('Adjacent side cannot be zero');
  }
  return Math.atan(opposite / adjacent) * (180 / Math.PI);
};