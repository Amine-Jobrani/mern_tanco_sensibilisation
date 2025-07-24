from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

class CyberGuardApp:
    def __init__(self):
        self.questions_data = self.load_questions()
        self.metiers = ['Ressources Humaines', 'Achats', 'Informatique', 'Techniciens']

    def load_questions(self):
        try:
            excel_file = 'data/QCM_Cybersecurite_OT_Complet.xlsx'
            if not os.path.exists(excel_file):
                print(f"Fichier Excel non trouvé : {excel_file}")
                return []
            df = pd.read_excel(excel_file, sheet_name=0)
            questions_list = []
            for index, row in df.iterrows():
                question = {
                    'metier': row['Service'],
                    'numero': int(row['Numéro']),
                    'scenario': row['Question'],
                    'option1': row['Réponse 1'],
                    'option2': row['Réponse 2'],
                    'option3': row['Réponse 3'],
                    'bonne_reponse': int(str(row['Bonne réponse']).replace('Réponse ', '')),
                    'explication': row['Explication']
                }
                questions_list.append(question)
            print(f"✅ {len(questions_list)} questions chargées depuis le fichier Excel")
            return questions_list
        except Exception as e:
            print(f"❌ Erreur lors du chargement du fichier Excel: {e}")
            return []

    def get_questions_by_metier(self, metier):
        return [q for q in self.questions_data if q['metier'] == metier]

    def calculate_score(self, answers, metier):
        questions = self.get_questions_by_metier(metier)
        correct = 0
        total = len(questions)
        for i, question in enumerate(questions):
            if str(answers.get(f'q_{i}')) == str(question['bonne_reponse']):
                correct += 1
        return {'correct': correct, 'total': total, 'percentage': (correct/total)*100 if total > 0 else 0}

def get_badge(percentage):
    if percentage >= 90:
        return {'name': 'Expert Cyber', 'color': 'success', 'icon': '🛡️'}
    elif percentage >= 75:
        return {'name': 'Garde Vigilant', 'color': 'primary', 'icon': '👁️'}
    elif percentage >= 60:
        return {'name': 'Apprenti Sécurité', 'color': 'warning', 'icon': '🎯'}
    else:
        return {'name': 'Formation Nécessaire', 'color': 'danger', 'icon': '📚'}

cyber_app = CyberGuardApp()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        prenom = request.form.get('prenom')
        nom = request.form.get('nom')
        service = request.form.get('service')
        session['user'] = {
            'prenom': prenom,
            'nom': nom,
            'service': service
        }
        return redirect(url_for('index'))
    return render_template('login.html', metiers=cyber_app.metiers)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
def index():
    if 'user' not in session:
        return redirect(url_for('login'))
    stats = {
        'incidents_year': 2847,
        'companies_affected': 67,
        'average_cost': '2.3M€'
    }
    user_service = session['user']['service']
    return render_template(
        'index.html',
        stats=stats,
        metiers=[user_service],
        user=session['user']
    )

@app.route('/formation/<metier>')
def formation(metier):
    if 'user' not in session:
        return redirect(url_for('login'))
    user_service = session['user']['service']
    if metier != user_service:
        return redirect(url_for('formation', metier=user_service))
    questions = cyber_app.get_questions_by_metier(metier)
    return render_template('formation.html', metier=metier, questions=questions)

@app.route('/quiz/<metier>')
def quiz(metier):
    if 'user' not in session:
        return redirect(url_for('login'))
    user_service = session['user']['service']
    if metier != user_service:
        return redirect(url_for('quiz', metier=user_service))
    questions = cyber_app.get_questions_by_metier(metier)
    return render_template('quiz.html', metier=metier, questions=questions)

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    metier = data.get('metier')
    answers = data.get('answers')
    score = cyber_app.calculate_score(answers, metier)
    if 'scores' not in session:
        session['scores'] = {}
    session['scores'][metier] = {
        'score': score,
        'date': datetime.now().isoformat(),
        'answers': answers
    }
    session.permanent = True
    return jsonify({
        'success': True,
        'score': score,
        'badge': get_badge(score['percentage'])
    })

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    user = session['user']
    scores = session.get('scores', {})
    user_service = user.get('service')
    user_score = scores.get(user_service)
    avg_score = user_score['score']['percentage'] if user_score else 0
    badges = [get_badge(user_score['score']['percentage'])] if user_score else []
    metiers = [user_service]
    return render_template(
        'dashboard.html',
        scores={user_service: user_score} if user_score else {},
        avg_score=avg_score,
        badges=badges,
        metiers=metiers,
        get_badge=get_badge,
        user=user
    )

@app.route('/admin')
def admin():
    all_questions = cyber_app.questions_data
    questions_by_metier = {}
    for metier in cyber_app.metiers:
        questions_by_metier[metier] = cyber_app.get_questions_by_metier(metier)
    return render_template(
        'admin.html',
        questions_by_metier=questions_by_metier,
        total_questions=len(all_questions)
    )

if __name__ == '__main__':
    app.run(debug=True)
