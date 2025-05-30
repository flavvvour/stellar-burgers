import constructorReducer, {
  addIngredient,
  removeIngredient,
  reorderIngredients,
  addBun,
  clearConstructor
} from '../slices/constructorSlice';

import { TIngredient, TConstructorIngredient } from '@utils-types';

jest.mock('nanoid', () => ({
  nanoid: () => 'fixed-id'
}));

const mockIngredient = (id: string): TIngredient => ({
  _id: id,
  name: `Начинка ${id}`,
  type: 'sauce',
  proteins: 0,
  fat: 0,
  carbohydrates: 0,
  calories: 0,
  price: 10,
  image: '',
  image_mobile: '',
  image_large: ''
});

const mockBun = (id: string): TIngredient => ({
  _id: id,
  name: `Булка ${id}`,
  type: 'bun',
  proteins: 5,
  fat: 10,
  carbohydrates: 15,
  calories: 200,
  price: 100,
  image: '',
  image_mobile: '',
  image_large: ''
});

describe('constructorSlice', () => {
  it('добавляет ингредиент', () => {
    const initial = { bun: null, ingredients: [] as TConstructorIngredient[] };
    const action = addIngredient(mockIngredient('1'));
    const result = constructorReducer(initial, action);
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toMatchObject({
      _id: '1',
      name: 'Начинка 1',
      id: 'fixed-id',
      uniqueId: 'fixed-id'
    });
  });
  it('не добавляет некорректную булку', () => {
    const initial = { bun: null, ingredients: [] };
    const invalidBun = { ...mockIngredient('1'), type: 'sauce' };
    const result = constructorReducer(initial, addBun(invalidBun));
    expect(result.bun).toBeNull();
  });

  it('не добавляет некорректный ингредиент', () => {
    const initial = { bun: null, ingredients: [] };
    const invalidIngredient = { ...mockIngredient(''), _id: '', name: '' };
    const result = constructorReducer(
      initial,
      addIngredient(invalidIngredient)
    );
    expect(result.ingredients).toHaveLength(0);
  });

  it('не переставляет ингредиенты при неправильных индексах', () => {
    const initial = {
      bun: null,
      ingredients: [
        { ...mockIngredient('1'), id: 'id-1', uniqueId: 'uid-1' },
        { ...mockIngredient('2'), id: 'id-2', uniqueId: 'uid-2' }
      ]
    };

    const result = constructorReducer(
      initial,
      reorderIngredients({ fromIndex: -1, toIndex: 10 })
    );

    expect(result.ingredients.map((i) => i._id)).toEqual(['1', '2']);
  });

  it('удаляет ингредиент по uniqueId', () => {
    const initial = {
      bun: null,
      ingredients: [
        { ...mockIngredient('1'), id: 'id-1', uniqueId: 'uid-1' },
        { ...mockIngredient('2'), id: 'id-2', uniqueId: 'uid-2' }
      ]
    };

    const action = removeIngredient('uid-1');
    const result = constructorReducer(initial, action);

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]._id).toBe('2');
  });

  it('меняет порядок ингредиентов', () => {
    const initial = {
      bun: null,
      ingredients: [
        { ...mockIngredient('1'), id: 'id-1', uniqueId: 'uid-1' },
        { ...mockIngredient('2'), id: 'id-2', uniqueId: 'uid-2' },
        { ...mockIngredient('3'), id: 'id-3', uniqueId: 'uid-3' }
      ]
    };
    const action = reorderIngredients({ fromIndex: 0, toIndex: 2 });
    const result = constructorReducer(initial, action);

    expect(result.ingredients.map((i) => i._id)).toEqual(['2', '3', '1']);
  });

  it('добавляет булку', () => {
    const bun = mockBun('b1');
    const initial = {
      bun: null,
      ingredients: []
    };
    const action = addBun(bun);
    const result = constructorReducer(initial, action);
    expect(result.bun).toMatchObject({
      _id: 'b1',
      name: 'Булка b1',
      id: 'fixed-id',
      uniqueId: 'fixed-id'
    });
  });

  it('сбрасывает конструктор', () => {
    const initial = {
      bun: { ...mockBun('b1'), id: 'id-b1', uniqueId: 'uid-b1' },
      ingredients: [
        { ...mockIngredient('1'), id: 'id-1', uniqueId: 'uid-1' },
        { ...mockIngredient('2'), id: 'id-2', uniqueId: 'uid-2' }
      ]
    };
    const action = clearConstructor();
    const result = constructorReducer(initial, action);

    expect(result.bun).toBeNull();
    expect(result.ingredients).toEqual([]);
  });
});
