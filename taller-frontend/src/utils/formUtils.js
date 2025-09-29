export const getChangedFields = (original, updated, allowedFields = null) => {
    const changed = {};
    for (const key in updated) {
      if (
        (!allowedFields || allowedFields.includes(key)) &&
        updated[key] !== "" &&
        updated[key] !== original?.[key]
      ) {
        changed[key] = updated[key];
      }
    }
    return changed;
  };
  