async function submitProjection(item: ProjectionRow) {
  if (!item.projection_action) {
    showMessage("error", "Select Projection Action");
    return;
  }

  setSubmittingId(item.id);
  try {
    const response = await fetch("/api/projection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        projection_action: item.projection_action,
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      showMessage("success", "Projection Updated");
      fetchData();
    } else {
      showMessage("error", result.error || "Projection Update Failed");
    }
  } catch (error) {
    console.error(error);
    showMessage("error", "Projection Update Failed");
  } finally {
    setSubmittingId(null);
  }
}

async function submitStock(item: ProjectionRow) {
  if (!item.stock_action) {
    showMessage("error", "Select Stock Action");
    return;
  }

  const qty = Number(item.stock_qty);
  if (!Number.isFinite(qty) || qty < 0) {
    showMessage("error", "Stock Quantity must be a valid non-negative number");
    return;
  }

  if (item.stock_action === "Issue" && qty <= 0) {
    showMessage("error", "Enter Stock Quantity before issuing");
    return;
  }

  setSubmittingId(item.id);
  try {
    const response = await fetch("/api/projection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        stock_qty: qty,
        stock_action: item.stock_action,
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      showMessage("success", "Stock Updated");
      fetchData();
    } else {
      showMessage("error", result.error || "Stock Update Failed");
    }
  } catch (error) {
    console.error(error);
    showMessage("error", "Stock Update Failed");
  } finally {
    setSubmittingId(null);
  }
}

async function clearProjection(id: number) {
  if (!confirm("Clear this projection? This cannot be undone.")) return;

  setSubmittingId(id);
  try {
    const response = await fetch("/api/projection", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      showMessage("success", "Projection Cleared");
      fetchData();
    } else {
      showMessage("error", result.error || "Delete Failed");
    }
  } catch (error) {
    console.error(error);
    showMessage("error", "Delete Failed");
  } finally {
    setSubmittingId(null);
  }
}