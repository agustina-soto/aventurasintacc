export class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Dibuja el objeto en el canvas
    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Actualiza la posición del objeto
    update() {
        // Aquí puedes agregar lógica de movimiento
        this.y += 2; // Por ejemplo, hacer que caiga
    }

    // Detecta colisión con los keypoints de la pose
    checkCollisionWithPose(pose) {
        if (!pose || !pose.keypoints) return false;

        // Obtener keypoints relevantes (cabeza y hombros)
        const nose = pose.keypoints[0];
        const leftShoulder = pose.keypoints[5];
        const rightShoulder = pose.keypoints[6];

        if (!nose || !leftShoulder || !rightShoulder) return false;

        // Crear un área de colisión basada en la cabeza y hombros
        const headShoulderArea = {
            x: Math.min(leftShoulder.x, rightShoulder.x),
            y: nose.y,
            width: Math.abs(rightShoulder.x - leftShoulder.x),
            height: Math.abs(nose.y - leftShoulder.y)
        };

        // Verificar si hay intersección entre el objeto y el área de la cabeza/hombros
        return this.intersects(headShoulderArea);
    }

    // Verifica si este objeto intersecta con otro rectángulo
    intersects(rect) {
        return !(this.x > rect.x + rect.width || 
                this.x + this.width < rect.x || 
                this.y > rect.y + rect.height ||
                this.y + this.height < rect.y);
    }
}

export class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.objects = [];
        this.spawnInterval = 2000; // Tiempo entre spawns de objetos (2 segundos)
        this.lastSpawnTime = 0;
    }

    update(currentTime, poses) {
        // Crear nuevos objetos periódicamente
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObject();
            this.lastSpawnTime = currentTime;
        }

        // Actualizar y verificar colisiones para cada objeto
        this.objects = this.objects.filter(obj => {
            obj.update();

            // Verificar colisiones con todas las poses detectadas
            for (const pose of poses) {
                if (obj.checkCollisionWithPose(pose)) {
                    // Colisión detectada! 
                    // Aquí puedes agregar lógica de puntuación o efectos
                    return false; // Eliminar el objeto
                }
            }

            // Eliminar objetos que salen de la pantalla
            return obj.y < this.canvas.canvas.height;
        });
    }

    draw() {
        // Dibujar todos los objetos
        for (const obj of this.objects) {
            obj.draw(this.canvas.ctx);
        }
    }

    spawnObject() {
        // Crear un nuevo objeto en una posición aleatoria en la parte superior
        const width = 30;
        const height = 30;
        const x = Math.random() * (this.canvas.canvas.width - width);
        const y = -height;
        
        this.objects.push(new GameObject(x, y, width, height));
    }
} 