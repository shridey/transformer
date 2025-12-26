import type { Accessor, Comparator, Group, Mapper, Predicate } from "../types";
import { resolve } from "../utils";

export class LazyPipeline<T> {
  private source: Iterable<T>;

  private constructor(source: Iterable<T>) {
    this.source = source;
  }

  static from<T>(data: T[]): LazyPipeline<T> {
    return new LazyPipeline(data);
  }

  filter(predicate: Predicate<T>): LazyPipeline<T> {
    const previousSource = this.source;

    function* filterGenerator() {
      for (const item of previousSource) {
        if (predicate(item)) {
          yield item;
        }
      }
    }

    return new LazyPipeline(filterGenerator());
  }

  /**
   * Reshape Fix:
   * 1. Uses Mapper<T, U[K]> to ensure the function returns the correct type for that key.
   * 2. Uses 'as U' instead of 'any' for the accumulator.
   */
  reshape<U>(schema: { [K in keyof U]: Mapper<T, U[K]> }): LazyPipeline<U> {
    const previousSource = this.source;

    function* mapGenerator() {
      // Explicitly cast Object.keys to be a list of the keys of U
      const keys = Object.keys(schema) as Array<keyof U>;

      for (const item of previousSource) {
        // Initialize as U. We are confident because we iterate strictly over U's keys below.
        const newItem = {} as U;

        for (const key of keys) {
          newItem[key] = schema[key](item);
        }

        yield newItem;
      }
    }

    return new LazyPipeline(mapGenerator());
  }

  /**
   * GROUP BY (Blocking Operation):
   * Consumes the entire source to categorize items into groups.
   * Accepts a key name OR a selector function.
   * Yields "Group" objects: { key: K, items: T[] }
   */
  groupBy<K extends string | number | symbol>(
    keySelector: Accessor<T, K>
  ): LazyPipeline<Group<K, T>> {
    const previousSource = this.source;

    function* groupGenerator() {
      const groups = new Map<K, T[]>();

      // Blocking operation: must consume source to group
      for (const item of previousSource) {
        const key = resolve(item, keySelector);
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(item);
      }

      for (const [key, items] of groups) {
        yield { key, items };
      }
    }
    return new LazyPipeline(groupGenerator());
  }

  /**
   * FLAT MAP (Unwind):
   * Transforms each item into an array (or iterable), then flattens the result.
   * Useful for "unwinding" nested lists.
   * * Example: User[] -> User.orders[] -> Order[]
   */
  flatMap<U>(selector: (item: T) => Iterable<U>): LazyPipeline<U> {
    const previousSource = this.source;

    function* flatMapGenerator() {
      for (const item of previousSource) {
        const subList = selector(item);
        // Yield each item from the sub-list individually
        for (const subItem of subList) {
          yield subItem;
        }
      }
    }

    return new LazyPipeline(flatMapGenerator());
  }

  /**
   * REDUCE (Terminal Operation):
   * Reduces the entire stream to a single value.
   * Similar to Array.prototype.reduce, but works on the Generator source.
   */
  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    let accumulator = initialValue;
    for (const item of this.source) {
      accumulator = reducer(accumulator, item);
    }
    return accumulator;
  }

  /**
   * COLLECT (Terminal Operation):
   * Materializes the pipeline into an array and runs an aggregator function on it.
   * This is perfect for using your 'Aggregate' helpers on the whole list.
   */
  collect<R>(aggregator: (items: T[]) => R): R {
    // We must materialize the stream to an array because
    // your Aggregate helpers expect T[]
    const allItems = this.execute();
    return aggregator(allItems);
  }

  sort(compareFn: Comparator<T>): LazyPipeline<T> {
    const previousSource = this.source;

    function* sortGenerator() {
      const allItems = [...previousSource];
      allItems.sort(compareFn);

      for (const item of allItems) {
        yield item;
      }
    }

    return new LazyPipeline(sortGenerator());
  }

  execute(): T[] {
    return [...this.source];
  }

  take(count: number): LazyPipeline<T> {
    const previousSource = this.source;

    function* takeGenerator() {
      let taken = 0;
      for (const item of previousSource) {
        if (taken >= count) break; // Stop pulling data once we hit the limit
        yield item;
        taken++;
      }
    }

    return new LazyPipeline(takeGenerator());
  }
}
