function indexToLabel(n, i) {
    const faceNum = Math.floor(i / (n * n));
    const indexInFace = i % (n * n);
    const row = Math.floor(indexInFace / n);
    const col = indexInFace % n;
    return (faceNum + 1, row + 1, col + 1);
}

// TODO: new line every 10 labels
function indicesToLabels(n, indices) {
    return indices.map(i => indexToLabel(n, i));
}