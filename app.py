from flask import Flask, request, jsonify ,render_template
from flask_sqlalchemy import SQLAlchemy
import stripe


app = Flask(__name__)

stripe.api_key = 'sk_test_51PiAPE2K0ifXcFmuCT4ObEUnkwe8wyY0FCOAaqN14ix9HdUW1KYAyhzZJe0eoUGxWmu5Oq0npaKf3tOnzaVoig9Y00XSExMXti'

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/bookstore'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'created_at': self.created_at,
            'password':self.password
        }

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100),nullable=False)
    src = db.Column(db.String(50),nullable=True)
    # created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'description': self.description,
            'price': self.price,
            'category':self.category,
            'src':self.src
            # 'created_at': self.created_at
        }

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('cart_items', lazy=True))
    book = db.relationship('Book', backref=db.backref('cart_items', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'quantity': self.quantity,
            'created_at': self.created_at,
            'book': self.book.to_dict()  # Optional: Include book details
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_price = db.Column(db.Integer , nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('orders', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_price': self.total_price,
            'status': self.status,
            'created_at': self.created_at
        }

class OrderDetail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)

    order = db.relationship('Order', backref=db.backref('order_details', lazy=True))
    book = db.relationship('Book', backref=db.backref('order_details', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'book_id': self.book_id,
            'quantity': self.quantity,
            'price': self.price,
            'book': self.book.to_dict()
        }

# إنشاء الجداول
with app.app_context():
    db.create_all()

@app.route('/')
def login():
    return render_template("login.html", custom_css="login")

@app.route('/sign_up')
def sign_up():
    return render_template("sign_up.html",custom_css="sign_up")

@app.route('/main')
def main():
    return render_template("main.html",custom_css="main")

@app.route('/cart')
def cart():
    return render_template("cart.html",custom_css="cart")

@app.route('/bookdetail')
def bookdetail():
    return render_template("book_details.html",custom_css="book_details")

@app.route('/purchasing')
def purchasing():
    return render_template("purchasing.html",custom_css="purchasing")
   
@app.route('/my_purchasing')
def my_purchasing():
    return render_template("my_purchasing.html",custom_css="my_purchasing")
# Adding
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    user = User(first_name=first_name, last_name=last_name, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    book_id = data.get('book_id')
    quantity = data.get('quantity')
    user_id = data.get('user_id')  
    new_cart_item = CartItem(user_id=user_id, book_id=book_id, quantity=quantity)
    db.session.add(new_cart_item)
    db.session.commit()
    return jsonify({'message': 'Item added to cart successfully'}), 201

@app.route('/add_order', methods=['POST'])
def add_order():
    data = request.get_json()
    user_id = data.get('user_id')
    total_price = data.get('total_price')
    status = data.get('status')
    new_order = Order(user_id=user_id, total_price=total_price,status=status)
    db.session.add(new_order)
    db.session.commit()
    # return jsonify(new_order.to_dict()), 201
    return jsonify({'message': 'Item added to cart successfully'}), 201
    

@app.route('/add_order_detail', methods=['POST'])
def add_order_detail():
    data = request.json
    order_id = data.get('order_id')
    book_id = data.get('book_id')
    quantity = data.get('quantity')
    price = data.get('price')
    order_detail = OrderDetail(
        order_id=order_id,
        book_id=book_id,
        quantity=quantity,
        price=price
    )
    try:
        # إضافة الكائن إلى قاعدة البيانات
        db.session.add(order_detail)
        db.session.commit()
        return jsonify({'message': 'Order detail added successfully', 'order_detail': order_detail.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Deleting
@app.route('/cartdetails/<int:item_id>', methods=['DELETE'])
def delete_cart_item(item_id):
    item = CartItem.query.get(item_id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    else:
        return jsonify({'error': 'Item not found'}), 404

@app.route('/cartdetails', methods=['DELETE'])
def delete_all_cart_items():
    try:
        # حذف جميع العناصر من جدول CartItem
        CartItem.query.delete()
        db.session.commit()
        return jsonify({'message': 'All items deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#Getting
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [user.to_dict() for user in users]
    return jsonify(user_list), 200

@app.route('/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    book_list = [book.to_dict() for book in books]
    return jsonify(book_list), 200

@app.route('/getorder', methods=['GET'])
def getorder():
    orders = Order.query.all()
    order_list = [order.to_dict() for order in orders]
    return jsonify(order_list), 200

@app.route('/book_details/<int:book_id>', methods=['GET'])
def book_details(book_id):
    book = Book.query.get(book_id)
    if book:
        return jsonify(book.to_dict()),200
    else:
        return jsonify({'error': 'Book not found'}), 404

@app.route('/cartdetails', methods=['GET'])
def cartdetails():
    items = CartItem.query.all()
    items_list = [item.to_dict() for item in items]
    return jsonify(items_list), 200
        # return jsonify({'error': 'No items found'}), 404


@app.route('/purchasing')
def index():
    return render_template('purchasing.html',custom_css="purchasing")


@app.route('/get_order_detail',methods=['GET'])
def get_order_detail():
    order_det = OrderDetail.query.all()
    order_det_list = [order.to_dict() for order in order_det]
    return jsonify(order_det_list), 200

# Stripe 
@app.route('/charge', methods=['POST'])
def charge():
    try:
        amount = 5000  # المبلغ بعملات السن
        charge = stripe.Charge.create(
            amount=amount,
            currency='usd',
            description='Flask Charge',
            source=request.form['stripeToken']
        )
        return jsonify({"status": "success", "message": "Charge successful"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


if __name__ == '__main__':
    app.run(debug=True)
