/**
 * ⚠️ DOM Patch defensivo para prevenir errores como:
 * "Failed to execute 'removeChild' on 'Node'" en apps React
 * 
 * Causa típica: Google Translate o extensiones modifican el DOM sin que React lo sepa.
 * 
 * Este parche intercepta llamadas a `removeChild` e `insertBefore` y evita que la app se rompa,
 * mostrando el error en consola en vez de lanzar una excepción fatal.
 */

if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      console.error(
        '[DOM PATCH] No se pudo remover un hijo de un nodo distinto:',
        child,
        this
      );
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.error(
        '[DOM PATCH] No se pudo insertar antes de un nodo de referencia inválido:',
        referenceNode,
        this
      );
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}
