// Enhanced JavaScript for CyberGuard Industrie
class CyberGuardApp {
    constructor() {
        this.init();
        this.setupAnimations();
        this.setupInteractions();
        this.setupTheme();
    }

    init() {
        this.initializeTooltips();
        this.initializePopovers();
        this.setupSmoothScroll();
        this.setupProgressAnimations();
    }

    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    initializePopovers() {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.formation-card, .stat-card, .question-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        this.animateCounters();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-card h3');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            if (!isNaN(target)) {
                this.animateValue(counter, 0, target, 2000);
            }
        });
    }

    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            if (element.textContent.includes('%')) {
                element.textContent = current + '%';
            } else {
                element.textContent = current.toLocaleString();
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    setupProgressAnimations() {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });
    }

    setupInteractions() {
        this.setupButtonEffects();
        this.setupAutoSave();
        this.setupNotifications();
        this.setupLoadingStates();
    }

    setupButtonEffects() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupAutoSave() {
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                this.autoSave();
            });
        });
    }

    autoSave() {
        const formData = new FormData(document.querySelector('#quizForm'));
        const answers = {};
        for (let [key, value] of formData.entries()) {
            answers[key] = value;
        }
        localStorage.setItem('quiz_progress', JSON.stringify({
            answers: answers,
            timestamp: new Date().toISOString(),
            metier: window.currentMetier || ''
        }));
    }

    setupNotifications() {
        this.createToastContainer();
    }

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: duration });
        toast.show();
        
        setTimeout(() => {
            if (toastElement && toastElement.parentNode) {
                toastElement.remove();
            }
        }, duration + 1000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle',
            'primary': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    setupLoadingStates() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function() {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<span class="loading"></span> Chargement...';
                    submitBtn.disabled = true;
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 3000);
                }
            });
        });
    }

    setupTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.applyTheme(prefersDark.matches ? 'dark' : 'light');
        
        prefersDark.addEventListener('change', (e) => {
            this.applyTheme(e.matches ? 'dark' : 'light');
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);
    }

    static reportIncident() {
        const app = new CyberGuardApp();
        app.showToast('Formulaire de signalement ouvert', 'info');
        
        const modalHTML = `
            <div class="modal fade" id="reportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Signaler un incident
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="reportForm">
                                <div class="mb-3">
                                    <label class="form-label">Type d'incident</label>
                                    <select class="form-select" required>
                                        <option>Email suspect</option>
                                        <option>Comportement anormal du système</option>
                                        <option>Tentative d'intrusion</option>
                                        <option>Perte/vol de matériel</option>
                                        <option>Autre</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" rows="4" placeholder="Décrivez l'incident en détail..." required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Niveau d'urgence</label>
                                    <div class="btn-group d-flex" role="group">
                                        <input type="radio" class="btn-check" name="urgency" id="low" value="low">
                                        <label class="btn btn-outline-success" for="low">Faible</label>
                                        <input type="radio" class="btn-check" name="urgency" id="medium" value="medium">
                                        <label class="btn btn-outline-warning" for="medium">Moyen</label>
                                        <input type="radio" class="btn-check" name="urgency" id="high" value="high">
                                        <label class="btn btn-outline-danger" for="high">Élevé</label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" form="reportForm" class="btn btn-warning">
                                <i class="fas fa-paper-plane me-2"></i>Envoyer le rapport
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('reportModal'));
        modal.show();
        
        document.getElementById('reportModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
        document.getElementById('reportForm').addEventListener('submit', function(e) {
            e.preventDefault();
            app.showToast('Incident signalé avec succès! Le RSSI a été notifié.', 'success');
            modal.hide();
        });
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.cyberGuardApp = new CyberGuardApp();
});

// Fonctions globales pour la compatibilité
window.reportIncident = CyberGuardApp.reportIncident;

// Gestion des erreurs globales
window.addEventListener('error', function(event) {
    console.error('Erreur JavaScript:', event.error);
    if (window.cyberGuardApp) {
        window.cyberGuardApp.showToast('Une erreur inattendue s\'est produite', 'danger');
    }
});
