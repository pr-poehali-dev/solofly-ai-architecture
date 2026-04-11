import { useEffect } from "react";

export default function GrantDoc() {
  useEffect(() => {
    document.title = "Заявка Старт-Пром-1 — SoloFly / ООО МАТ-Лабс";
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=PT+Sans:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #f0f0f0; }

        .doc-wrap {
          font-family: 'PT Serif', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1a1a1a;
          background: #fff;
          max-width: 210mm;
          margin: 0 auto;
          padding: 25mm 20mm 25mm 25mm;
        }

        .print-btn {
          font-family: 'PT Sans', sans-serif;
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1a56db;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 999;
        }
        .print-btn:hover { background: #1648c0; }

        .doc-header {
          text-align: center;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 2px solid #1a1a1a;
        }
        .doc-header .program {
          font-family: 'PT Sans', sans-serif;
          font-size: 9pt;
          color: #555;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .doc-header h1 {
          font-size: 14pt;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 6px;
        }
        .doc-header .org {
          font-family: 'PT Sans', sans-serif;
          font-size: 10pt;
          color: #444;
        }

        .section {
          margin-bottom: 28px;
          page-break-inside: avoid;
        }
        .section-title {
          font-family: 'PT Sans', sans-serif;
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #1a1a1a;
          border-left: 4px solid #1a56db;
          padding-left: 10px;
          margin-bottom: 12px;
        }
        .section-num {
          color: #1a56db;
          margin-right: 6px;
        }

        p { margin-bottom: 8px; }
        p:last-child { margin-bottom: 0; }

        ul, ol {
          padding-left: 20px;
          margin-bottom: 8px;
        }
        li { margin-bottom: 4px; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10.5pt;
        }
        th {
          font-family: 'PT Sans', sans-serif;
          font-weight: 700;
          font-size: 9.5pt;
          background: #f4f7fb;
          border: 1px solid #c8d6e8;
          padding: 6px 10px;
          text-align: left;
        }
        td {
          border: 1px solid #c8d6e8;
          padding: 6px 10px;
          vertical-align: top;
        }
        tr:nth-child(even) td { background: #fafbfd; }

        .highlight-box {
          background: #f4f7fb;
          border-left: 3px solid #1a56db;
          padding: 10px 14px;
          margin: 10px 0;
          font-size: 11pt;
        }
        .highlight-box strong { color: #1a1a1a; }

        .total-row td {
          font-weight: 700;
          background: #eef2fb !important;
        }

        .doc-footer {
          margin-top: 36px;
          padding-top: 14px;
          border-top: 1px solid #ccc;
          font-family: 'PT Sans', sans-serif;
          font-size: 9pt;
          color: #777;
          text-align: center;
        }

        @media print {
          body { background: #fff; }
          .print-btn { display: none; }
          .doc-wrap { padding: 15mm 15mm 15mm 20mm; box-shadow: none; }
          .section { page-break-inside: avoid; }
        }
      `}</style>

      <button className="print-btn" onClick={() => window.print()}>
        Сохранить PDF
      </button>

      <div className="doc-wrap">

        {/* Шапка */}
        <div className="doc-header">
          <div className="program">
            Конкурс «Старт-Пром-1» (очередь 3) · Фонд содействия инновациям<br />
            Федеральный проект «Содействие проведению НИОКР в гражданских отраслях промышленности»
          </div>
          <h1>
            Разработка интеллектуальной системы принятия решений<br />
            для автономного беспилотного воздушного судна<br />
            в условиях неопределённости и неполной информации
          </h1>
          <div className="org">ООО «МАТ-Лабс» · Программный комплекс SoloFly · 2026</div>
        </div>

        {/* 1. Цель проекта */}
        <div className="section">
          <div className="section-title"><span className="section-num">1.</span>Цель проекта</div>
          <p>
            Целью проекта является разработка интеллектуальной системы принятия решений (ИСПР) для автономного беспилотного воздушного судна (БВС), функционирующей в условиях неопределённости и неполной информации о состоянии внешней среды и технических систем воздушного судна.
          </p>
          <p>В рамках проекта планируется создание экспериментального образца программного комплекса, обеспечивающего:</p>
          <ul>
            <li>автономное планирование маршрута с учётом динамически изменяющихся ограничений (рельеф, погода, зоны ограничения полётов);</li>
            <li>выработку управляющих решений в нештатных ситуациях без участия оператора;</li>
            <li>верификацию алгоритмов на стендовых и лётных испытаниях.</li>
          </ul>
          <p>
            Результатом НИОКР станет программный комплекс, готовый к коммерциализации в сегментах промышленного мониторинга, инспекции инфраструктуры и картографирования.
          </p>
        </div>

        {/* 2. Описание продукта */}
        <div className="section">
          <div className="section-title"><span className="section-num">2.</span>Описание продукта проекта</div>
          <p>
            <strong>Продукт</strong> — программный комплекс SoloFly, интеллектуальная система принятия решений для автономного управления БВС, разработанная ООО «МАТ-Лабс».
          </p>
          <p><strong>Архитектура продукта</strong> включает три взаимодействующих уровня:</p>
          <ul>
            <li><strong>Бортовой модуль</strong> — алгоритмическое ядро реального времени на базе Ardupilot/PX4, взаимодействующее с полётным контроллером по протоколу MAVLink v2;</li>
            <li><strong>Облачная платформа</strong> — модули адаптивной маршрутизации, компьютерного зрения и управления роем БВС;</li>
            <li><strong>Командный центр</strong> — веб-интерфейс для мониторинга, постановки задач и анализа телеметрии.</li>
          </ul>
          <p><strong>Ключевые технические характеристики:</strong></p>
          <ul>
            <li>автономное завершение миссии при полной потере канала управления;</li>
            <li>точность обнаружения объектов на основе нейросетевых алгоритмов — 97,4%;</li>
            <li>поддержка группового управления (рой до 20 БВС одновременно);</li>
            <li>соответствие требованиям 152-ФЗ и Воздушного кодекса РФ.</li>
          </ul>
          <p><strong>Стадия готовности:</strong> MVP запущен в режиме открытого бета-тестирования. Ведётся подключение реальных дронов и верификация автономных сценариев полётов.</p>
        </div>

        {/* 3. Команда */}
        <div className="section">
          <div className="section-title"><span className="section-num">3.</span>Команда проекта</div>
          <table>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Роль в проекте</th>
                <th>Компетенции</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Тюрин Максим</td>
                <td>Генеральный директор, CEO, сооснователь</td>
                <td>Стратегическое управление, авиационное право, бизнес-развитие</td>
              </tr>
              <tr>
                <td>Тюрин Александр</td>
                <td>CTO, сооснователь</td>
                <td>Архитектура системы, MAVLink-интеграция, бортовое ПО</td>
              </tr>
              <tr>
                <td>Петрушкин Олег</td>
                <td>Lead ML Engineer</td>
                <td>ИИ-ядро, компьютерное зрение, алгоритмы планирования траектории</td>
              </tr>
              <tr>
                <td>Красильников Данила</td>
                <td>Head of Product</td>
                <td>UX/UI, тестирование с клиентами, конструктор полётных сценариев</td>
              </tr>
            </tbody>
          </table>
          <p>
            Команда обладает компетенциями в области встраиваемых систем, машинного обучения, авиационной электроники и коммерциализации технологических продуктов. Вся разработка ведётся силами российских специалистов.
          </p>
        </div>

        {/* 4. Аналоги */}
        <div className="section">
          <div className="section-title"><span className="section-num">4.</span>Аналоги и их производители</div>
          <table>
            <thead>
              <tr>
                <th>Продукт</th>
                <th>Производитель</th>
                <th>Страна</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>UgCS</td><td>SPH Engineering</td><td>Латвия</td></tr>
              <tr><td>DJI FlightHub 2</td><td>DJI</td><td>Китай</td></tr>
              <tr><td>Auterion Suite</td><td>Auterion AG</td><td>Швейцария</td></tr>
              <tr><td>Skybrush</td><td>CollMot Robotics</td><td>Венгрия</td></tr>
              <tr><td>Percepto AIM</td><td>Percepto</td><td>Израиль</td></tr>
              <tr><td>Geoscan Planner</td><td>Геоскан</td><td>Россия</td></tr>
            </tbody>
          </table>
        </div>

        {/* 5. Преимущества */}
        <div className="section">
          <div className="section-title"><span className="section-num">5.</span>Преимущества перед аналогами</div>
          <p><strong>Перед зарубежными решениями (UgCS, DJI FlightHub, Auterion, Percepto):</strong></p>
          <ul>
            <li>все данные хранятся на серверах в РФ — соответствие 152-ФЗ и требованиям безопасности для промышленных объектов;</li>
            <li>отсутствие зависимости от иностранной инфраструктуры и санкционных рисков;</li>
            <li>нативная поддержка российского законодательства (Воздушный кодекс РФ, приказ Минтранса № 494);</li>
            <li>полная локализация интерфейса и технической поддержки.</li>
          </ul>
          <p><strong>Перед отечественными решениями (Geoscan Planner):</strong></p>
          <ul>
            <li>интеллектуальная система принятия решений с автономным завершением миссии при потере связи — функция, отсутствующая у большинства российских аналогов;</li>
            <li>облачная архитектура без необходимости установки ПО на рабочем месте оператора;</li>
            <li>поддержка управления роем до 20 БВС одновременно;</li>
            <li>открытый стек (Ardupilot, PX4, MAVLink v2) — совместимость с широким парком дронов, а не только собственного производства.</li>
          </ul>
        </div>

        {/* 6. Бизнес-модель */}
        <div className="section">
          <div className="section-title"><span className="section-num">6.</span>Бизнес-модель</div>
          <p>Основная модель — <strong>SaaS-подписка</strong> (Software as a Service) с тремя уровнями доступа:</p>
          <table>
            <thead>
              <tr>
                <th>Тариф</th>
                <th>Стоимость</th>
                <th>Целевой сегмент</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Про</td>
                <td>2 900 руб./мес. или 24 900 руб./год</td>
                <td>Малые операторы, 1–5 дронов</td>
              </tr>
              <tr>
                <td>Команда</td>
                <td>7 900 руб./мес. или 69 900 руб./год</td>
                <td>Средние компании, до 20 дронов</td>
              </tr>
              <tr>
                <td>Enterprise</td>
                <td>от 49 000 руб./мес., по договору</td>
                <td>Крупные заказчики, on-premise</td>
              </tr>
            </tbody>
          </table>
          <p><strong>Дополнительные источники дохода:</strong></p>
          <ul>
            <li><strong>API-доступ</strong> для интеграции в корпоративные системы управления производством;</li>
            <li><strong>On-premise лицензия</strong> для объектов с требованиями к изолированной инфраструктуре;</li>
            <li><strong>Профессиональные услуги</strong> — внедрение, обучение операторов, кастомные интеграции.</li>
          </ul>
          <p>
            Модель обеспечивает предсказуемую выручку (MRR/ARR) и низкий барьер входа для новых клиентов при высоком потенциале масштабирования на Enterprise-сегмент.
          </p>
        </div>

        {/* 7. Рынок */}
        <div className="section">
          <div className="section-title"><span className="section-num">7.</span>Рынок продукта проекта</div>
          <p><strong>Целевые сегменты:</strong></p>
          <ul>
            <li>промышленный мониторинг (нефтегазовая, энергетическая, горнодобывающая отрасли);</li>
            <li>инспекция инфраструктуры (ЛЭП, трубопроводы, мосты, вышки связи);</li>
            <li>аэрофотосъёмка и картографирование;</li>
            <li>патрулирование периметра и охраняемых территорий;</li>
            <li>точное земледелие (агромониторинг).</li>
          </ul>
          <div className="highlight-box">
            <strong>Мировой рынок</strong> программного обеспечения для управления БВС оценивается в $2,8 млрд в 2024 году с прогнозируемым ростом до $7,4 млрд к 2030 году (CAGR ~17,5%).
          </div>
          <p>
            Российский рынок коммерческих беспилотных систем активно развивается в рамках национального проекта «Беспилотные авиационные системы» с общим финансированием свыше 45 млрд руб. до 2030 года.
          </p>
          <p>
            <strong>Адресный рынок (SOM)</strong> для SoloFly на горизонте 3 лет — российские операторы коммерческих БВС, использующие дроны на базе Ardupilot/PX4: оценочно 1 200–1 800 активных компаний и частных операторов.
          </p>
        </div>

        {/* 8. Расходование гранта */}
        <div className="section">
          <div className="section-title"><span className="section-num">8.</span>Планы по расходованию средств гранта</div>
          <div className="highlight-box" style={{ marginBottom: 12 }}>
            <strong>Общий размер гранта: 5 000 000 руб.</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>Статья расходов</th>
                <th style={{ whiteSpace: "nowrap" }}>Сумма, руб.</th>
                <th>Назначение</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Фонд оплаты труда</td>
                <td style={{ whiteSpace: "nowrap" }}>3 000 000</td>
                <td>Оплата труда команды разработчиков в течение срока выполнения НИОКР</td>
              </tr>
              <tr>
                <td>Приобретение оборудования</td>
                <td style={{ whiteSpace: "nowrap" }}>900 000</td>
                <td>Полётные контроллеры (Pixhawk, Cube Orange), onboard-компьютеры (Jetson Nano), радиомодули, измерительное оборудование для стендовых испытаний</td>
              </tr>
              <tr>
                <td>Проведение испытаний</td>
                <td style={{ whiteSpace: "nowrap" }}>600 000</td>
                <td>Аренда полигона для лётных экспериментов, верификация алгоритмов в реальных условиях</td>
              </tr>
              <tr>
                <td>Патентование и правовая охрана</td>
                <td style={{ whiteSpace: "nowrap" }}>300 000</td>
                <td>Оформление патента на алгоритм принятия решений, регистрация программы для ЭВМ</td>
              </tr>
              <tr>
                <td>Накладные расходы</td>
                <td style={{ whiteSpace: "nowrap" }}>200 000</td>
                <td>Облачная инфраструктура, лицензии на ПО, командировки</td>
              </tr>
              <tr className="total-row">
                <td>ИТОГО</td>
                <td style={{ whiteSpace: "nowrap" }}>5 000 000</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: 10 }}>
            По итогам финансирования будет создан экспериментальный образец программного комплекса, пройдены стендовые и лётные испытания, получена правовая охрана на ключевые результаты интеллектуальной деятельности.
          </p>
        </div>

        {/* Footer */}
        <div className="doc-footer">
          ООО «МАТ-Лабс» · mat-labs.ru · Программный комплекс SoloFly · {new Date().getFullYear()}
        </div>

      </div>
    </>
  );
}
