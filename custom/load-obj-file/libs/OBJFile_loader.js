function getObjFileText(filePath){
    let response = readTextFile(filePath);
    console.log(response);
    const objFile = new OBJFile(response);
    const output = objFile.parse();

    return output;
}

function insertVertexBuffer(vertexArray, vertexBuffer, vertexIndex){
    vertexBuffer.push(vertexArray[vertexIndex].x);
    vertexBuffer.push(vertexArray[vertexIndex].y);
    vertexBuffer.push(vertexArray[vertexIndex].z);
}

function insertTextureBuffer(textureArray, textureBuffer, textureCoordsIndex){
    textureBuffer.push(textureArray[textureCoordsIndex].u);
    textureBuffer.push(textureArray[textureCoordsIndex].v);
}

function insertNormalBuffer(normalArray, normalBuffer, vertexNormalIndex){
    normalBuffer.push(normalArray[vertexNormalIndex].x);
    normalBuffer.push(normalArray[vertexNormalIndex].y);
    normalBuffer.push(normalArray[vertexNormalIndex].z);
}

function parseObjFile(filePath){
    const data = getObjFileText(filePath);
    console.log(data);
    let vertexBuffer = [], normalBuffer = [], textureBuffer = [];

    const vertexArray = data.models[0].vertices;
    const textureArray = data.models[0].textureCoords;
    const normalArray = data.models[0].vertexNormals;

    const faceArray = data.models[0].faces;
    let faceLength = data.models[0].faces.length;
    for(let i = 0; i < faceLength; i++){
        let verticeArray = faceArray[i].vertices;
        let verticeLength = verticeArray.length;
        for(let j = 0; j < verticeLength; j++){
            let vertexIndex = verticeArray[j].vertexIndex - 1;
            let textureCoordsIndex = verticeArray[j].textureCoordsIndex - 1;
            let vertexNormalIndex = verticeArray[j].vertexNormalIndex - 1;
            if(vertexArray.length > 0){
                insertVertexBuffer(vertexArray, vertexBuffer, vertexIndex);
            }
            if(textureArray.length > 0){
                insertTextureBuffer(textureArray, textureBuffer, textureCoordsIndex);
            }
            if(normalBuffer.length > 0) {
                insertNormalBuffer(normalArray, normalBuffer, vertexNormalIndex);
            }
        }
    }

    return {
        vertexBuffer,
        textureBuffer,
        normalBuffer
    }
}