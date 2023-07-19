class Animal {
  constructor(name) {
    this.name = name
  }
  eat() {
    console.log(this.name + ' is eating.')
  }
}

// 鸵鸟类组合 Animal 类，并添加额外的方法
class Ostrich {
  constructor(name) {
    this.animal = new Animal(name)
  }

  // 委托 Animal 类的方法
  eat() {
    this.animal.eat()
  }
  walk() {
    console.log(this.animal.name + ' is walking.')
  }
}

// Dog 类组合 Animal 类，并添加额外的方法
class Dog {
  constructor(name) {
    this.animal = new Animal(name)
  }

  // 委托 Animal 类的方法
  eat() {
    this.animal.eat()
  }

  walk() {
    console.log(this.animal.name + ' is walking.')
  }
}

const dog = new Dog('Dog')
dog.eat() // Dog is eating.
dog.walk() // Dog is walking.

const ostrich = new Ostrich('Ostrich')
ostrich.eat() // Ostrich is eating.
ostrich.walk() // Ostrich is walking.
