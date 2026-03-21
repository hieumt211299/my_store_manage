const applyOrderInventoryDelta = (inventory, quantityDelta, status) => {
  const next = { ...inventory };

  if (quantityDelta === 0) return next;

  if (status === 'received') {
    next.available_quantity += -quantityDelta;
  } else if (status === 'customer_holds' || status === 'store_holds') {
    next.reserved_quantity += quantityDelta;
  }

  return next;
};

const applyImportInventoryDelta = (inventory, quantityDelta, status) => {
  const next = { ...inventory };

  if (quantityDelta === 0) return next;

  if (status === 'completed') {
    next.available_quantity += quantityDelta;
  } else if (status === 'pending') {
    next.incoming_quantity += quantityDelta;
  }

  return next;
};

describe('inventory bucket rules for resale flows', () => {
  test('order in customer_holds reserves stock', () => {
    const inventory = {
      incoming_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 10,
    };

    const next = applyOrderInventoryDelta(inventory, 2, 'customer_holds');

    expect(next).toEqual({
      incoming_quantity: 0,
      reserved_quantity: 2,
      available_quantity: 10,
    });
  });

  test('order resale to store releases reserved stock', () => {
    let inventory = {
      incoming_quantity: 0,
      reserved_quantity: 2,
      available_quantity: 10,
    };

    inventory = applyOrderInventoryDelta(inventory, -2, 'customer_holds');
    inventory = applyOrderInventoryDelta(inventory, 2, 'resold_to_store');

    expect(inventory).toEqual({
      incoming_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 10,
    });
  });

  test('received order consumes available stock and clears reserved stock', () => {
    let inventory = {
      incoming_quantity: 0,
      reserved_quantity: 2,
      available_quantity: 10,
    };

    inventory = applyOrderInventoryDelta(inventory, -2, 'customer_holds');
    inventory = applyOrderInventoryDelta(inventory, 2, 'received');

    expect(inventory).toEqual({
      incoming_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 8,
    });
  });

  test('pending import adds incoming stock', () => {
    const inventory = {
      incoming_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 10,
    };

    const next = applyImportInventoryDelta(inventory, 3, 'pending');

    expect(next).toEqual({
      incoming_quantity: 3,
      reserved_quantity: 0,
      available_quantity: 10,
    });
  });

  test('import resale to Ancarat clears incoming stock', () => {
    let inventory = {
      incoming_quantity: 3,
      reserved_quantity: 0,
      available_quantity: 10,
    };

    inventory = applyImportInventoryDelta(inventory, -3, 'pending');
    inventory = applyImportInventoryDelta(inventory, 3, 'resold_to_ancarat');

    expect(inventory).toEqual({
      incoming_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 10,
    });
  });

  test('completed import moves stock from incoming to available', () => {
    let inventory = {
      incoming_quantity: 3,
      reserved_quantity: 0,
      available_quantity: 10,
    };

    inventory = applyImportInventoryDelta(inventory, -3, 'pending');
    inventory = applyImportInventoryDelta(inventory, 3, 'completed');

    expect(inventory).toEqual({
      incoming_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 13,
    });
  });
});
